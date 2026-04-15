import { useAPIClient } from "@shared/api/client";
import {
  deleteProfilePicture as deleteProfilePictureApi,
  getExtFromMime,
  getProfilePicture,
  getUploadUrl,
  saveProfilePictureKey,
  uploadFileToS3,
} from "@shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { StartupStatus, useStartup } from "@/context/startup";

export function useProfilePicture(userId: string): {
  profilePicUrl: string | null;
  status: string;
  isLoading: boolean;
  isInitialLoading: boolean;
  handleUpload: (file: File) => Promise<void>;
  handleRemove: () => Promise<void>;
} {
  const startupStatus = useStartup();
  const api = useAPIClient();
  const apiRef = useRef(api);
  apiRef.current = api;

  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
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

  const handleUpload = useCallback(
    async (file: File) => {
      if (startupStatus !== StartupStatus.Ready) {
        return;
      }
      setIsLoading(true);
      setStatus("Getting upload URL...");
      try {
        const ext = getExtFromMime(file.type);
        const { presigned_url, key } = await getUploadUrl(api, userId, ext);

        setStatus("Uploading to S3...");
        await uploadFileToS3(presigned_url, file);

        setStatus("Saving to profile...");
        await saveProfilePictureKey(api, userId, key);

        setStatus("Fetching display URL...");
        const refreshed = await getProfilePicture(api, userId);
        setProfilePicUrl(refreshed?.presigned_url ?? null);
        setStatus("Upload complete!");
      } catch (err) {
        setStatus(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [api, userId, startupStatus],
  );

  const handleRemove = useCallback(async () => {
    if (startupStatus !== StartupStatus.Ready) {
      return;
    }
    setIsLoading(true);
    setStatus("Removing profile picture...");
    try {
      await deleteProfilePictureApi(api, userId);
      setProfilePicUrl(null);
      setStatus("Profile picture removed!");
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [api, userId, startupStatus]);

  return {
    profilePicUrl,
    status,
    isLoading,
    isInitialLoading,
    handleUpload,
    handleRemove,
  };
}