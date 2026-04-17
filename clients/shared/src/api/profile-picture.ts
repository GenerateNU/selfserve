import type { HttpClient } from "../types/api.types";
import { ApiError } from "../types/api.types";

export type UploadUrlResponse = {
  presigned_url: string;
  key: string;
};

export type ProfilePictureResponse = {
  key: string;
  presigned_url: string;
};

export async function getProfilePicture(
  api: HttpClient,
  userId: string,
): Promise<ProfilePictureResponse | null> {
  try {
    return await api.get<ProfilePictureResponse>(
      `/users/${userId}/profile-picture`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
}

export function getUploadUrl(
  api: HttpClient,
  userId: string,
  ext: string,
): Promise<UploadUrlResponse> {
  return api.get<UploadUrlResponse>(`/s3/upload-url/${userId}`, { ext });
}

export function saveProfilePictureKey(
  api: HttpClient,
  userId: string,
  key: string,
): Promise<void> {
  return api.put<void>(`/users/${userId}/profile-picture`, { key });
}

export function deleteProfilePicture(
  api: HttpClient,
  userId: string,
): Promise<void> {
  return api.delete<void>(`/users/${userId}/profile-picture`);
}

export async function uploadFileToS3(
  presignedUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to upload to S3");
  }
}

export async function uploadToS3PresignedPut(
  presignedUrl: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": contentType,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to upload to S3");
  }
}