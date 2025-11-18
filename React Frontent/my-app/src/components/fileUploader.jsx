"use client";

import { useState } from "react";

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
import { uploadEncryptedFiles } from "@/userAPI";

// Select icon
const getFileIcon = (file) => {
  const fileType = file.file.type;
  const fileName = file.file.name;

  if (fileType.includes("pdf") || fileName.endsWith(".pdf"))
    return <FileTextIcon className="size-4 opacity-60" />;

  if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  )
    return <FileArchiveIcon className="size-4 opacity-60" />;

  if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  )
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;

  if (fileType.startsWith("video/"))
    return <VideoIcon className="size-4 opacity-60" />;

  if (fileType.startsWith("audio/"))
    return <HeadphonesIcon className="size-4 opacity-60" />;

  if (fileType.startsWith("image/"))
    return <ImageIcon className="size-4 opacity-60" />;

  return <FileIcon className="size-4 opacity-60" />;
};

export default function FileUploader({ teamName, publicKey, onUploadComplete }) {
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
  });

  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);

  // ---------------------
  // 🔥 Handle Upload
  // ---------------------
  const handleUpload = async () => {
    if (!publicKey) return alert("No public key available!");

    if (files.length === 0) return alert("Please select files first.");

    setUploading(true);
    setMessages([{ text: "Encrypting files...", color: "yellow" }]);

    const rawFiles = files.map((f) => f.file); // extract actual File objects

    const results = await uploadEncryptedFiles(rawFiles, teamName, publicKey);

    const msgList = results.map((res) =>
      res.success
        ? { text: `✔ ${res.file} encrypted & uploaded`, color: "green" }
        : { text: `❌ ${res.file} failed: ${res.error}`, color: "red" }
    );

    setMessages(msgList);
    setUploading(false);

    clearFiles();

    if (onUploadComplete) onUploadComplete();
  };

  return (
    <div className="flex flex-col gap-3">

      {/* DROPZONE */}
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
        <input {...getInputProps()} className="sr-only" />

        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full border bg-background">
            <FileUpIcon className="size-4 opacity-60" />
          </div>
          <p className="text-sm font-medium">Upload files</p>
          <p className="text-xs text-muted-foreground">Drag & drop or click</p>
        </div>
      </div>

      {/* ERRORS */}
      {errors.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircleIcon className="size-3" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* SELECTED FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex size-10 items-center justify-center rounded border">
                  {getFileIcon(file)}
                </div>

                <div className="flex flex-col min-w-0">
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
                onClick={() => removeFile(file.id)}
                className="-me-2 size-8"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}

          {/* REMOVE ALL */}
          <Button size="sm" variant="outline" onClick={clearFiles}>
            Remove all
          </Button>

          {/* 🔥 UPLOAD BUTTON (REAL ENCRYPTION UPLOAD) */}
          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={uploading}
            onClick={handleUpload}
          >
            {uploading ? "Encrypting & Uploading..." : "Upload Encrypted Files"}
          </Button>
        </div>
      )}

      {/* STATUS MESSAGES */}
      {messages.length > 0 && (
        <div className="mt-3 space-y-1">
          {messages.map((msg, i) => (
            <p
              key={i}
              className={
                msg.color === "green"
                  ? "text-green-400 text-xs"
                  : msg.color === "red"
                  ? "text-red-400 text-xs"
                  : "text-yellow-300 text-xs"
              }
            >
              {msg.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
