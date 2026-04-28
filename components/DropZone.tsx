"use client";

import {
  useCallback,
  useMemo,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FileText, Image as ImageIcon, X, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/tiff": [".tiff", ".tif"],
};

const MAX_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 25;

interface DropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  compact?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKey(f: File): string {
  return `${f.name}\0${f.size}\0${f.lastModified}`;
}

export function DropZone({ files, onFilesChange, compact }: DropZoneProps) {
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    setPreviewIndex((i) => {
      if (files.length === 0) return 0;
      return Math.min(i, files.length - 1);
    });
  }, [files.length]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return;
      const seen = new Set(files.map(fileKey));
      const merged = [...files];
      for (const f of accepted) {
        if (merged.length >= MAX_FILES) break;
        const k = fileKey(f);
        if (seen.has(k)) continue;
        seen.add(k);
        merged.push(f);
      }
      onFilesChange(merged);
    },
    [files, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: true,
    noClick: files.length > 0,
    noKeyboard: files.length > 0,
  });

  const previewFile = files[previewIndex] ?? files[0];
  const objectUrl = useMemo(() => {
    if (!previewFile) return null;
    return URL.createObjectURL(previewFile);
  }, [previewFile]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function removeAt(index: number, e?: MouseEvent) {
    e?.stopPropagation();
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
    setPreviewIndex((p) => {
      if (next.length === 0) return 0;
      if (index < p) return p - 1;
      if (index === p) return Math.min(p, next.length - 1);
      return p;
    });
  }

  if (files.length > 0 && previewFile && objectUrl) {
    const isPdf = previewFile.type === "application/pdf";
    const isImage = previewFile.type?.startsWith("image/");
    const multi = files.length > 1;

    return (
      <div
        {...getRootProps()}
        className="flex h-full flex-col rounded-lg border bg-card overflow-hidden"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col gap-2 border-b px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {files.length} {files.length === 1 ? "Datei" : "Dateien"}
              {files.length >= MAX_FILES ? " (Maximum)" : ""}
            </span>
            {files.length < MAX_FILES && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[11px]"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
              >
                <Plus className="h-3 w-3" />
                Weitere
              </Button>
            )}
          </div>
          {multi && (
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-0.5">
              {files.map((f, i) => (
                <div
                  key={`${fileKey(f)}-${i}`}
                  className={cn(
                    "flex max-w-[220px] items-center gap-0.5 rounded-md border px-1.5 py-1 text-[11px] transition-colors",
                    i === previewIndex
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border/60 bg-muted/30 text-muted-foreground",
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex(i);
                    }}
                    className="min-w-0 flex-1 truncate text-left hover:underline"
                  >
                    {f.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeAt(i, e)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    aria-label={`${f.name} entfernen`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {!multi && (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                  isPdf ? "bg-red-500/10" : "bg-blue-500/10",
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
                  {previewFile.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(previewFile.size)}
                </p>
              </div>
              <button
                onClick={(e) => removeAt(0, e)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="relative flex-1 min-h-0 bg-background">
          {isPdf ? (
            <iframe
              src={objectUrl}
              className="h-full w-full"
              title="PDF preview"
            />
          ) : isImage ? (
            <div className="relative h-full w-full">
              <Image
                src={objectUrl}
                alt={previewFile.name}
                fill
                unoptimized
                className="object-contain p-4"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Preview not available
            </div>
          )}
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <p className="text-sm font-medium">
                {files.length >= MAX_FILES
                  ? "Maximum erreicht"
                  : "Ablegen zum Hinzufügen"}
              </p>
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
          : "border-border hover:border-foreground/20 hover:bg-accent/50",
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-4 rounded-lg bg-secondary p-3">
        <Upload
          className={cn(
            "h-5 w-5 transition-colors",
            isDragActive ? "text-foreground" : "text-muted-foreground",
          )}
        />
      </div>
      <p className="text-sm font-medium">
        {isDragActive ? "Dateien hier ablegen" : "Dokumente hier ablegen"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {isDragActive ? "Loslassen zum Hochladen" : "oder klicken zum Auswählen"}
      </p>
      <p className="mt-4 text-[11px] text-muted-foreground/60">
        PDF, JPG, PNG, WEBP, TIFF · max. 50 MB pro Datei · bis zu {MAX_FILES}{" "}
        Dateien
      </p>
    </div>
  );
}
