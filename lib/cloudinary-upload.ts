import { withoutAuth } from "@/services/api";

export interface CloudinarySignData {
  cloud_name: string;
  api_key: string;
  timestamp: string;
  folder: string;
  signature: string;
  upload_url: string;
}

/**
 * Request signed upload params from the backend.
 * Call once per batch — the same signature can be reused for every file in that folder.
 */
export async function signUpload(folder: string): Promise<CloudinarySignData> {
  const res = await withoutAuth.post<CloudinarySignData>("/cloudinary/sign-upload", { folder });
  return res.data;
}

/**
 * Upload a single file directly to Cloudinary using the existing axios instance.
 * Axios passes onUploadProgress through to the underlying XHR, giving us
 * per-file progress without leaving our API setup.
 * Returns the secure_url of the uploaded asset.
 */
export async function uploadFileToCloudinary(
  file: File,
  sign: CloudinarySignData,
  onProgress: (pct: number) => void
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.api_key);
  fd.append("timestamp", sign.timestamp);
  fd.append("folder", sign.folder);
  fd.append("signature", sign.signature);

  const res = await withoutAuth.post<{ secure_url: string }>(sign.upload_url, fd, {
    headers: { "Content-Type": undefined },
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  return res.data.secure_url;
}
