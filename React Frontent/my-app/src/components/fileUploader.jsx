"use client";

import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileUpIcon,
  HeadphonesIcon,
  ImageIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";

import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

// Select correct icon based on file type
const getFileIcon = (file) => {
  const fileType = file.file.type;
  const fileName = file.file.name;

  if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
    return <FileTextIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith("video/")) {
    return <VideoIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith("audio/")) {
    return <HeadphonesIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 opacity-60" />;
  }

  return <FileIcon className="size-4 opacity-60" />;
};

export default function FileUploader({ teamName }) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const maxFiles = 10;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    initialFiles: [], // no dummy files
  });

  return (
    <div className="flex flex-col gap-2">
      {/* Dropzone */}
      <div
        role="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 data-[dragging=true]:bg-accent/50"
      >
        <input {...getInputProps()} className="sr-only" aria-label="Upload files" />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full border bg-background">
            <FileUpIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Upload files</p>
          <p className="mb-2 text-xs text-muted-foreground">Drag & drop or click to browse</p>

          <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground/70">
            <span>All files</span>
            <span>∙</span>
            <span>Max {maxFiles} files</span>
            <span>∙</span>
            <span>Up to {formatBytes(maxSize)}</span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircleIcon className="size-3" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex aspect-square size-10 items-center justify-center rounded border">
                  {getFileIcon(file)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-[13px] font-medium">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.file.size)}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent"
                onClick={() => removeFile(file.id)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}

          {files.length > 1 && (
            <Button size="sm" variant="outline" onClick={clearFiles}>
              Remove all files
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
