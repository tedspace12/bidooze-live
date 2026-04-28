"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signUpload, uploadFileToCloudinary, type CloudinarySignData } from "@/lib/cloudinary-upload";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileItem = {
  id: string;
  file: File;
  progress: number;       // 0–100
  url: string | null;     // set on success
  error: string | null;   // set on failure
};

interface FileUploaderProps {
  /** Backend folder path, e.g. `auctioneers/${token}/licenses` */
  folder: string;
  label: string;
  accept?: string;
  maxFiles?: number;
  required?: boolean;
  /** Called whenever the uploaded URL list changes. null = not ready yet. */
  onChange: (urls: string[] | null) => void;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileUploader({
  folder,
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxFiles,
  required,
  onChange,
  error: fieldError,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [signData, setSignData] = useState<CloudinarySignData | null>(null);
  const [signing, setSigning] = useState(false);

  // Keep a stable ref to onChange so the effect below doesn't re-run when
  // the parent re-renders and passes a new function reference.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Notify parent after every items change — outside the setState updater so
  // we never call setState on one component while rendering another.
  useEffect(() => {
    const allDone = items.length > 0 && items.every((it) => it.url !== null);
    onChangeRef.current(allDone ? items.map((it) => it.url!) : null);
  }, [items]);

  const updateItem = (id: string, patch: Partial<FileItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const uploadFile = async (item: FileItem, sign: CloudinarySignData) => {
    updateItem(item.id, { error: null, progress: 0 });
    try {
      const url = await uploadFileToCloudinary(item.file, sign, (pct) => {
        updateItem(item.id, { progress: pct });
      });
      updateItem(item.id, { url, progress: 100 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      updateItem(item.id, { error: msg, progress: 0 });
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;

    // Get or reuse sign data (sign once per batch)
    let sign = signData;
    if (!sign) {
      setSigning(true);
      try {
        sign = await signUpload(folder);
        setSignData(sign);
      } catch {
        const newItems: FileItem[] = files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          url: null,
          error: "Could not reach upload server. Please try again.",
        }));
        setItems((prev) => [...prev, ...newItems]);
        return;
      } finally {
        setSigning(false);
      }
    }

    const newItems: FileItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      url: null,
      error: null,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Upload all new files concurrently
    await Promise.allSettled(newItems.map((item) => uploadFile(item, sign!)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleFiles(files);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const retryItem = async (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;

    let sign = signData;
    if (!sign) {
      try {
        sign = await signUpload(folder);
        setSignData(sign);
      } catch {
        updateItem(id, { error: "Could not reach upload server. Please try again." });
        return;
      }
    }
    await uploadFile(item, sign);
  };

  const canAddMore = !maxFiles || items.length < maxFiles;
  const hasItems = items.length > 0;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </p>

      {/* Drop zone — only shown when more files can be added */}
      {canAddMore && (
        <div
          className={cn(
            "border border-dashed rounded-xl p-6 flex flex-col items-center justify-center",
            "hover:bg-muted/50 transition cursor-pointer text-center",
            signing && "opacity-60 pointer-events-none"
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
          }}
        >
          <Upload className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-green-700">
              {signing ? "Preparing upload…" : "Click to upload"}
            </span>
            {!signing && " or drag files here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, JPEG, PNG — Max 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={!maxFiles || maxFiles > 1}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* File list */}
      {hasItems && (
        <ul className="space-y-2 mt-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              {/* Status icon */}
              <div className="shrink-0">
                {item.url ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : item.error ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
              </div>

              {/* File info + progress */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-foreground">{item.file.name}</p>
                {item.error ? (
                  <p className="text-xs text-destructive mt-0.5">{item.error}</p>
                ) : item.url ? (
                  <p className="text-xs text-muted-foreground mt-0.5">Uploaded</p>
                ) : (
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1">
                {item.error && (
                  <button
                    type="button"
                    onClick={() => retryItem(item.id)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Retry upload"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Remove file"
                  disabled={item.progress > 0 && !item.url && !item.error}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {fieldError && (
        <p className="text-sm text-destructive">{fieldError}</p>
      )}
    </div>
  );
}
