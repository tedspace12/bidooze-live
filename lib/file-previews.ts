const fileObjectUrlCache = new WeakMap<File, string>();

export const getObjectUrlForFile = (file: File): string => {
  const existing = fileObjectUrlCache.get(file);
  if (existing) return existing;

  const nextUrl = URL.createObjectURL(file);
  fileObjectUrlCache.set(file, nextUrl);
  return nextUrl;
};

export const getObjectUrlsForFiles = (files?: File[] | null): string[] =>
  (files || []).map((file) => getObjectUrlForFile(file));

export const getObjectUrlMapForLotImages = (
  lotImages?: Record<string, File[]> | null
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(lotImages || {}).map(([lotKey, files]) => [
      lotKey,
      files.map((file) => getObjectUrlForFile(file)),
    ])
  );

export const revokeObjectUrlForFile = (file?: File | null) => {
  if (!file) return;

  const existing = fileObjectUrlCache.get(file);
  if (!existing) return;

  URL.revokeObjectURL(existing);
  fileObjectUrlCache.delete(file);
};

export const revokeRemovedObjectUrls = (
  previousFiles?: File[] | null,
  nextFiles?: File[] | null
) => {
  const nextSet = new Set(nextFiles || []);

  (previousFiles || []).forEach((file) => {
    if (!nextSet.has(file)) {
      revokeObjectUrlForFile(file);
    }
  });
};

export const revokeRemovedObjectUrlsForLotImages = (
  previousLotImages?: Record<string, File[]> | null,
  nextLotImages?: Record<string, File[]> | null
) => {
  const lotKeys = new Set([
    ...Object.keys(previousLotImages || {}),
    ...Object.keys(nextLotImages || {}),
  ]);

  lotKeys.forEach((lotKey) => {
    revokeRemovedObjectUrls(previousLotImages?.[lotKey], nextLotImages?.[lotKey]);
  });
};
