import { useAPIClient } from "@shared/api/client";
import {
  deleteProfilePicture as deleteProfilePictureApi,
  getExtFromMime,
  getProfilePicture,
  getUploadUrl,
  saveProfilePictureKey,
  uploadFileToS3,
} from "@shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
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
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["profile-picture", userId] as const,
    [userId],
  );

  const [status, setStatus] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  const { data: profilePicUrl = null, isLoading: isInitialLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getProfilePicture(api, userId);
      return data?.presigned_url ?? null;
    },
    enabled: startupStatus === StartupStatus.Ready && !!userId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (startupStatus !== StartupStatus.Ready) {
        return;
      }
      setStatus("Getting upload URL...");
      const ext = getExtFromMime(file.type);
      const { presigned_url, key } = await getUploadUrl(api, userId, ext);

      setStatus("Uploading to S3...");
      await uploadFileToS3(presigned_url, file);

      setStatus("Saving to profile...");
      await saveProfilePictureKey(api, userId, key);

      setStatus("Fetching display URL...");
      const refreshed = await getProfilePicture(api, userId);
      return refreshed?.presigned_url ?? null;
    },
    onSuccess: (newUrl) => {
      queryClient.setQueryData(queryKey, newUrl);
      setStatus("Upload complete!");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (startupStatus !== StartupStatus.Ready) {
        return;
      }
      setStatus("Removing profile picture...");
      await deleteProfilePictureApi(api, userId);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
      setStatus("Profile picture removed!");
    },
  });

  const handleUpload = useCallback(
    async (file: File) => {
      setIsMutating(true);
      try {
        const newUrl = await uploadMutation.mutateAsync(file);
        if (typeof newUrl === "string" || newUrl === null) {
          queryClient.setQueryData(queryKey, newUrl);
          setStatus("Upload complete!");
        }
      } catch (err) {
        setStatus(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsMutating(false);
      }
    },
    [queryClient, queryKey, uploadMutation],
  );

  const handleRemove = useCallback(async () => {
    setIsMutating(true);
    try {
      await removeMutation.mutateAsync();
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsMutating(false);
    }
  }, [removeMutation]);

  return {
    profilePicUrl,
    status,
    isLoading: isMutating,
    isInitialLoading,
    handleUpload,
    handleRemove,
  };
}
