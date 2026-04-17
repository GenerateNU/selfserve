import { useCallback, useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { useAPIClient } from "@shared/api/client";
import {
  deleteProfilePicture as deleteProfilePictureApi,
  getExtFromMime,
  getProfilePicture,
  getUploadUrl,
  getUserQueryKey,
  saveProfilePictureKey,
  uploadToS3PresignedPut,
} from "@shared";

import { StartupStatus, useStartup } from "@/context/startup";

async function readPickedImage(
  uri: string,
  mimeHint: string | null | undefined,
): Promise<{ body: ArrayBuffer; contentType: string }> {
  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error("Could not read the selected image");
  }
  const body = await res.arrayBuffer();
  const fromHeader = res.headers.get("content-type")?.split(";")[0]?.trim();
  const contentType =
    (mimeHint && mimeHint.length > 0 ? mimeHint : undefined) ||
    (fromHeader && fromHeader.length > 0 ? fromHeader : undefined) ||
    "image/jpeg";
  return { body, contentType };
}

export function useProfilePicture(userId: string | undefined): {
  profilePicUrl: string | null;
  status: string;
  isLoading: boolean;
  isInitialLoading: boolean;
  pickAndUpload: () => Promise<void>;
  handleRemove: () => Promise<void>;
} {
  const startupStatus = useStartup();
  const api = useAPIClient();
  const apiRef = useRef(api);
  apiRef.current = api;
  const queryClient = useQueryClient();

  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setProfilePicUrl(null);
      setIsInitialLoading(false);
      return;
    }
    if (startupStatus !== StartupStatus.Ready) {
      if (startupStatus !== StartupStatus.Loading) {
        setIsInitialLoading(false);
      }
      return;
    }

    const ac = new AbortController();
    setIsInitialLoading(true);
    void (async () => {
      try {
        const data = await getProfilePicture(apiRef.current, userId);
        if (!ac.signal.aborted) {
          setProfilePicUrl(data?.presigned_url ?? null);
        }
      } finally {
        if (!ac.signal.aborted) {
          setIsInitialLoading(false);
        }
      }
    })();
    return () => ac.abort();
  }, [userId, startupStatus]);

  const pickAndUpload = useCallback(async () => {
    if (!userId || startupStatus !== StartupStatus.Ready) {
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setStatus("Error: Photo library permission is required.");
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (picked.canceled || !picked.assets[0]) {
      return;
    }

    const asset = picked.assets[0];
    const uri = asset.uri;
    const mimeType = asset.mimeType ?? undefined;

    setIsLoading(true);
    setStatus("Reading image...");
    try {
      const { body, contentType } = await readPickedImage(uri, mimeType);
      const ext = getExtFromMime(contentType);

      setStatus("Getting upload URL...");
      const { presigned_url, key } = await getUploadUrl(api, userId, ext);

      setStatus("Uploading...");
      await uploadToS3PresignedPut(presigned_url, body, contentType);

      setStatus("Saving...");
      await saveProfilePictureKey(api, userId, key);

      setStatus("Refreshing...");
      const refreshed = await getProfilePicture(api, userId);
      setProfilePicUrl(refreshed?.presigned_url ?? null);
      await queryClient.invalidateQueries({ queryKey: getUserQueryKey(userId) });
      setStatus("Upload complete!");
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [api, userId, startupStatus, queryClient]);

  const handleRemove = useCallback(async () => {
    if (!userId || startupStatus !== StartupStatus.Ready) {
      return;
    }
    setIsLoading(true);
    setStatus("Removing profile picture...");
    try {
      await deleteProfilePictureApi(api, userId);
      setProfilePicUrl(null);
      await queryClient.invalidateQueries({ queryKey: getUserQueryKey(userId) });
      setStatus("Profile picture removed!");
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [api, userId, startupStatus, queryClient]);

  return {
    profilePicUrl,
    status,
    isLoading,
    isInitialLoading,
    pickAndUpload,
    handleRemove,
  };
}
