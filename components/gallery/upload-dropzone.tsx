"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";

interface UploadStatus {
  id: string;
  fileName: string;
  size: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UploadDropzoneProps {
  onUploadComplete: () => void;
}

const ACCEPTED = ".jpg,.jpeg,.png,.webp,.gif";

export default function UploadDropzone({
  onUploadComplete,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const newUploads: UploadStatus[] = files.map((f) => ({
        id: `${Date.now()}-${f.name}`,
        fileName: f.name,
        size: f.size,
        status: "pending",
      }));

      setUploads((prev) => [...newUploads, ...prev]);

      // Upload all files together in one request
      setUploads((prev) =>
        prev.map((u) =>
          newUploads.find((n) => n.id === u.id)
            ? { ...u, status: "uploading" }
            : u,
        ),
      );

      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          setUploads((prev) =>
            prev.map((u) =>
              newUploads.find((n) => n.id === u.id)
                ? { ...u, status: "done" }
                : u,
            ),
          );

          // Mark any per-file warnings as errors
          if (data.warnings?.length) {
            setUploads((prev) =>
              prev.map((u) => {
                const warn = data.warnings.find(
                  (w: { fileName: string; error: string }) =>
                    w.fileName === u.fileName,
                );
                return warn ? { ...u, status: "error", error: warn.error } : u;
              }),
            );
          }

          onUploadComplete();
        } else {
          setUploads((prev) =>
            prev.map((u) =>
              newUploads.find((n) => n.id === u.id)
                ? {
                    ...u,
                    status: "error",
                    error: data.error ?? "Upload failed.",
                  }
                : u,
            ),
          );
        }
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            newUploads.find((n) => n.id === u.id)
              ? {
                  ...u,
                  status: "error",
                  error: "Network error. Please try again.",
                }
              : u,
          ),
        );
      }
    },
    [onUploadComplete],
  );

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    processFiles(files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
    e.target.value = "";
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const clearDone = () => {
    setUploads((prev) => prev.filter((u) => u.status !== "done"));
  };

  const hasDone = uploads.some((u) => u.status === "done");
  const isUploading = uploads.some((u) => u.status === "uploading");

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/30",
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload images — click or drag and drop"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={onChange}
          aria-hidden="true"
        />

        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
            isDragging
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isDragging ? (
            <ImagePlus className="h-7 w-7" />
          ) : (
            <Upload className="h-7 w-7" />
          )}
        </div>

        <p className="text-base font-semibold text-foreground">
          {isDragging ? "Drop photos here" : "Drag & drop photos here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or{" "}
          <span className="font-medium text-primary underline-offset-2 hover:underline">
            browse files
          </span>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          JPEG, PNG, WebP, GIF · Max 10 MB per file
        </p>
      </div>

      {/* Upload status list */}
      {uploads.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Uploads</h3>
            {hasDone && !isUploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDone}
                className="h-7 text-xs"
              >
                Clear done
              </Button>
            )}
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {uploads.map((upload) => (
              <li
                key={upload.id}
                className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
              >
                {/* Status icon */}
                <span className="shrink-0">
                  {upload.status === "done" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {upload.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  {(upload.status === "uploading" ||
                    upload.status === "pending") && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </span>

                {/* File info */}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">
                    {upload.fileName}
                  </span>
                  {upload.error ? (
                    <span className="text-xs text-destructive">
                      {upload.error}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(upload.size)}
                    </span>
                  )}
                </span>

                {/* Remove button */}
                {upload.status !== "uploading" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => removeUpload(upload.id)}
                    aria-label={`Remove ${upload.fileName}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
