import { apiClient } from "@/lib/api/apiClient";
import type { User } from "@/lib/api/user-service";

export type CloudinaryUploadAsset =
  | File
  | Blob
  | {
      uri: string;
      name?: string;
      type?: string;
    };

export type AvatarUploadData = {
  avatar_url: string;
  public_id: string | null;
  user: User;
};

export type AvatarUploadResponse = {
  success: boolean;
  message: string;
  data: AvatarUploadData;
  errors?: Record<string, string[]> | null;
};

const sessionRequestOptions = {
  credentials: "include" as const,
};

function buildAvatarFormData(asset: CloudinaryUploadAsset) {
  const formData = new FormData();

  if (asset instanceof File) {
    formData.append("avatar", asset, asset.name);
    return formData;
  }

  if (asset instanceof Blob) {
    formData.append("avatar", asset, "avatar.jpg");
    return formData;
  }

  formData.append("avatar", asset as unknown as Blob);
  return formData;
}

export const cloudinaryService = {
  uploadAvatar(asset: CloudinaryUploadAsset) {
    return apiClient.post<AvatarUploadResponse>(
      "/me/avatar",
      buildAvatarFormData(asset),
      sessionRequestOptions,
    );
  },
};

export const { uploadAvatar } = cloudinaryService;
