"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Image as ImageIcon, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/tiff": [".tiff", ".tif"],
};

const MAX_SIZE = 50 * 1024 * 1024;

interface DropZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  compact?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DropZone({ file, onFileChange, compact }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFileChange(accepted[0]);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: !!file,
  });

  const objectUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const isPdf = file?.type === "application/pdf";
  const isImage = file?.type?.startsWith("image/");

  if (file && objectUrl) {
    return (
      <div
        {...getRootProps()}
        className="flex h-full flex-col rounded-lg border bg-card overflow-hidden"
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-3 border-b px-3 py-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              isPdf ? "bg-red-500/10" : "bg-blue-500/10"
            )}
          >
            {isPdf ? (
              <FileText className="h-4 w-4 text-red-400" />
            ) : (
              <ImageIcon className="h-4 w-4 text-blue-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">
              {file.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex-1 min-h-0 bg-background">
          {isPdf ? (
            <iframe
              src={objectUrl}
              className="h-full w-full"
              title="PDF preview"
            />
          ) : isImage ? (
            <img
              src={objectUrl}
              alt={file.name}
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Preview not available
            </div>
          )}
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <p className="text-sm font-medium">Drop to replace</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors",
        compact ? "p-6" : "p-10",
        compact ? "min-h-0 h-full" : "min-h-[240px]",
        isDragActive
          ? "border-foreground/25 bg-accent"
          : "border-border hover:border-foreground/20 hover:bg-accent/50"
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-4 rounded-lg bg-secondary p-3">
        <Upload
          className={cn(
            "h-5 w-5 transition-colors",
            isDragActive ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </div>
      <p className="text-sm font-medium">
        {isDragActive ? "Drop your file" : "Drop a document here"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {isDragActive ? "Release to upload" : "or click to browse"}
      </p>
      <p className="mt-4 text-[11px] text-muted-foreground/60">
        PDF, JPG, PNG, WEBP, TIFF · max 50 MB
      </p>
    </div>
  );
}
