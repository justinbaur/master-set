"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
  name: string;
  required?: boolean;
  currentImageUrl?: string;
  onFileSelected?: (file: File | null) => void;
}

export function ImageUpload({
  name,
  required = false,
  currentImageUrl,
  onFileSelected,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) {
        setPreview(null);
        onFileSelected?.(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      // Sync the file input so the form submission includes this file
      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileSelected?.(file);
    },
    [onFileSelected]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      if (item) handleFile(item.getAsFile());
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [handleFile]
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        id={name}
        accept="image/*"
        required={required}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={[
          "relative border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
        ].join(" ")}
      >
        {preview ? (
          <div className="relative h-64 w-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-lg p-2"
            />
            <span className="absolute bottom-2 right-2 text-xs bg-background/80 rounded px-2 py-1">
              Click to change
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <svg
              className="h-10 w-10 text-muted-foreground mb-3"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-medium">
              {isDragging ? "Drop it here!" : "Click, drag & drop, or paste an image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPEG, or WebP — max 10 MB · Ctrl+V / ⌘V to paste
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
