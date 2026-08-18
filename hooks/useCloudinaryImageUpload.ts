"use client";

import { useCallback, useState } from "react";
import { signUpload, uploadFileToCloudinary, type CloudinarySignData } from "@/lib/cloudinary-upload";

export type UploadingImage = {
  id: string;
  groupKey: string;
  file: File;
  progress: number;
  error: string | null;
};

interface UseCloudinaryImageUploadOptions {
  /** Cloudinary destination folder for a given group (e.g. a lot key). */
  folderFor: (groupKey: string) => string;
  /** Called once per batch with the URLs that uploaded successfully, in order. */
  onUploaded: (groupKey: string, urls: string[]) => void;
}

/**
 * Uploads files to Cloudinary as soon as they're picked, instead of holding
 * raw File objects until final submit. A single hook instance can track
 * multiple concurrent upload groups (e.g. one per lot) via `groupKey`, so
 * callers that need per-group state (like a lot images grid) don't have to
 * call this hook inside a loop.
 */
export function useCloudinaryImageUpload({ folderFor, onUploaded }: UseCloudinaryImageUploadOptions) {
  const [items, setItems] = useState<UploadingImage[]>([]);

  const uploadFiles = useCallback(
    async (groupKey: string, files: File[]) => {
      if (files.length === 0) return;

      const batch: UploadingImage[] = files.map((file) => ({
        id: crypto.randomUUID(),
        groupKey,
        file,
        progress: 0,
        error: null,
      }));
      setItems((prev) => [...prev, ...batch]);

      let sign: CloudinarySignData;
      try {
        sign = await signUpload(folderFor(groupKey));
      } catch {
        const batchIds = new Set(batch.map((b) => b.id));
        setItems((prev) =>
          prev.map((item) =>
            batchIds.has(item.id) ? { ...item, error: "Could not reach upload server. Please try again." } : item
          )
        );
        return;
      }

      const results = await Promise.allSettled(
        batch.map((item) =>
          uploadFileToCloudinary(item.file, sign, (pct) => {
            setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress: pct } : it)));
          })
        )
      );

      const succeededUrls: string[] = [];
      const failedIds = new Set<string>();
      results.forEach((result, index) => {
        const item = batch[index];
        if (result.status === "fulfilled") {
          succeededUrls.push(result.value);
        } else {
          failedIds.add(item.id);
          const message = result.reason instanceof Error ? result.reason.message : "Upload failed";
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, error: message } : it)));
        }
      });

      // Drop the successful entries from the transient list — they now live
      // in the caller's own state via onUploaded. Failed entries stay so the
      // user can see what went wrong.
      setItems((prev) => prev.filter((it) => failedIds.has(it.id) || !batch.some((b) => b.id === it.id)));

      if (succeededUrls.length > 0) {
        onUploaded(groupKey, succeededUrls);
      }
    },
    [folderFor, onUploaded]
  );

  const itemsForGroup = useCallback((groupKey: string) => items.filter((i) => i.groupKey === groupKey), [items]);

  const dismissError = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const isUploading = items.some((it) => !it.error);

  return { uploadFiles, itemsForGroup, dismissError, isUploading };
}
