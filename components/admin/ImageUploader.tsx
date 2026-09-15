"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export interface ImageItem {
  id?: string;
  storage_path: string;
  position: number;
  previewUrl?: string;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export default function ImageUploader({
  images,
  onChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  function getPublicUrl(path: string) {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress(`Processing ${files.length} image(s)...`);

    const newItems: ImageItem[] = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Format validation
      if (!file.type.startsWith("image/")) {
        setUploadError(`File "${file.name}" is not a valid image.`);
        continue;
      }

      setUploadProgress(`Optimizing image ${i + 1} of ${files.length}...`);

      let fileToUpload: File | Blob = file;
      try {
        // Fast client-side image compression for instant speeds
        const options = {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      } catch {
        fileToUpload = file;
      }

      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);

      const formData = new FormData();
      formData.append("file", fileToUpload, file.name);

      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          setUploadError(`Upload failed for ${file.name}: ${result.error || "Server error"}`);
        } else if (result.path) {
          newItems.push({
            storage_path: result.path,
            position: newItems.length,
            previewUrl: URL.createObjectURL(file),
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        setUploadError(`Upload failed: ${msg}`);
      }
    }

    onChange(newItems);
    setUploading(false);
    setUploadProgress("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleRemove(index: number) {
    const itemToRemove = images[index];
    if (itemToRemove?.storage_path && !itemToRemove.storage_path.startsWith("http")) {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ paths: [itemToRemove.storage_path] }),
        });
      } catch (err) {
        console.error("Storage delete error:", err);
      }
    }

    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      position: i,
    }));
    onChange(updated);
  }

  function handleMove(index: number, direction: "left" | "right") {
    if (
      (direction === "left" && index === 0) ||
      (direction === "right" && index === images.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const newItems = [...images];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reindexed = newItems.map((img, i) => ({
      ...img,
      position: i,
    }));

    onChange(reindexed);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="label text-xs">Product Images</label>
          <p className="text-xs text-[var(--text-muted)]">
            Upload multiple photos. The first image will be the primary cover image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-outline text-xs flex items-center justify-center gap-1.5 py-2.5 px-4 h-10 self-start sm:self-auto"
        >
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
              <span>{uploadProgress || "Uploading..."}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold">+</span>
              <span>Upload Images</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadError && (
        <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError("")}
            className="text-red-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Image Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center transition-all bg-[var(--surface)] ${
            uploading ? "opacity-60 cursor-wait" : "cursor-pointer hover:border-[var(--gold)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center bg-[var(--surface-hover)] text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm">
            {uploading ? (
              <span className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {uploading ? uploadProgress : "Click to select and upload product photos"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Auto-compressed JPG, PNG, WEBP up to 10MB each
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {images.map((item, index) => {
            const url = item.previewUrl || getPublicUrl(item.storage_path);

            return (
              <div
                key={item.storage_path || index}
                className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] group shadow-md"
              >
                <Image
                  src={url}
                  alt={`Product photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={url.startsWith("blob:")}
                />

                {/* Primary Cover Badge */}
                {index === 0 && (
                  <span
                    className="absolute top-2 left-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-lg z-10"
                    style={{
                      background: "linear-gradient(135deg, #f0d888 0%, #c9a84c 100%)",
                      color: "#0a0a0a",
                    }}
                  >
                    Cover Photo
                  </span>
                )}

                {/* Overlay Action Bar - visible on hover on desktop, always accessible on mobile/touch */}
                <div className="absolute inset-0 bg-black/60 sm:bg-black/70 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20 pointer-events-auto">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs shadow-md transition-transform active:scale-95"
                      title="Delete Image"
                      aria-label={`Delete image ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-black/75 backdrop-blur-sm px-2 py-1.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleMove(index, "left")}
                      disabled={index === 0}
                      className="text-white hover:text-[var(--gold)] disabled:opacity-30 px-2 py-1 text-xs font-bold active:scale-90"
                      title="Move Left"
                      aria-label="Move left"
                    >
                      ◀
                    </button>
                    <span className="text-[10px] text-white font-mono font-bold select-none">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "right")}
                      disabled={index === images.length - 1}
                      className="text-white hover:text-[var(--gold)] disabled:opacity-30 px-2 py-1 text-xs font-bold active:scale-90"
                      title="Move Right"
                      aria-label="Move right"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
