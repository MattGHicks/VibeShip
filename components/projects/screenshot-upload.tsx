"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { uploadScreenshot, deleteScreenshot } from "@/lib/actions/screenshots";

interface ScreenshotUploadProps {
  projectId?: string;
  currentUrl?: string | null;
  onUpload: (url: string | null) => void;
}

export function ScreenshotUpload({ projectId, currentUrl, onUpload }: ScreenshotUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Show preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) {
        formData.append("projectId", projectId);
      }

      const result = await uploadScreenshot(formData);

      if (result.error) {
        setError(result.error);
        setPreviewUrl(currentUrl || null);
        URL.revokeObjectURL(localPreview);
      } else if (result.url) {
        setPreviewUrl(result.url);
        onUpload(result.url);
        URL.revokeObjectURL(localPreview);
      }
    } catch {
      setError("Failed to upload screenshot. Please try again.");
      setPreviewUrl(currentUrl || null);
      URL.revokeObjectURL(localPreview);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!previewUrl || !projectId) {
      setPreviewUrl(null);
      onUpload(null);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteScreenshot(projectId, previewUrl);
      if (result.error) {
        setError(result.error);
      } else {
        setPreviewUrl(null);
        onUpload(null);
      }
    } catch {
      setError("Failed to delete screenshot. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted/50">
          <div className="relative aspect-video">
            <Image
              src={previewUrl}
              alt="Project screenshot"
              fill
              className="object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleDelete}
              disabled={isDeleting || isUploading}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            ) : (
              <div className="rounded-full bg-muted/50 p-2.5 mb-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {isUploading ? "Uploading..." : "Drop an image or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              JPEG, PNG, GIF, or WebP up to 5MB
            </p>
          </div>
        </div>
      )}

      {previewUrl && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Replace Screenshot
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </Button>
      )}
    </div>
  );
}
