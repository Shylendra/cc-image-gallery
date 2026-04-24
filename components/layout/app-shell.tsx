"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImageData } from "@/lib/types";
import AppHeader from "./app-header";
import AppSidebar from "./app-sidebar";
import GalleryGrid from "@/components/gallery/gallery-grid";
import UploadDropzone from "@/components/gallery/upload-dropzone";
import ImagePreviewModal from "@/components/gallery/image-preview-modal";

export type { ImageData };

export default function AppShell() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null);
  const [sidebarImage, setSidebarImage] = useState<ImageData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/images");
      const data = await res.json();
      if (data.success) setImages(data.images);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUploadComplete = useCallback(() => { fetchImages(); }, [fetchImages]);

  const handleSelectImage = useCallback((image: ImageData) => {
    setSidebarImage(image);
    setSidebarOpen(true);
  }, []);

  const handleToggleSelect = useCallback((url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUrls(new Set());
  }, []);

  const handleDeleteImage = useCallback(
    async (image: ImageData) => {
      setImages((prev) => prev.filter((img) => img.url !== image.url));
      setSelectedUrls((prev) => { const next = new Set(prev); next.delete(image.url); return next; });
      if (previewImage?.url === image.url) setPreviewImage(null);
      if (sidebarImage?.url === image.url) setSidebarImage(null);

      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: image.url }),
      });
      if (!res.ok) fetchImages();
    },
    [previewImage, sidebarImage, fetchImages],
  );

  const handleBulkDelete = useCallback(async () => {
    const urls = Array.from(selectedUrls);
    // Optimistic removal
    setImages((prev) => prev.filter((img) => !selectedUrls.has(img.url)));
    if (previewImage && selectedUrls.has(previewImage.url)) setPreviewImage(null);
    if (sidebarImage && selectedUrls.has(sidebarImage.url)) setSidebarImage(null);
    setSelectedUrls(new Set());

    const res = await fetch("/api/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });
    if (!res.ok) fetchImages();
  }, [selectedUrls, previewImage, sidebarImage, fetchImages]);

  const scrollToDropzone = useCallback(() => {
    dropzoneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedImage={sidebarImage}
        onClearSelection={() => setSidebarImage(null)}
        onOpenPreview={setPreviewImage}
        onDeleteImage={handleDeleteImage}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          onUploadClick={scrollToDropzone}
        />

        <main className="flex-1 h-screen overflow-hidden w-full">
          <div className="w-full h-full px-4 py-4">
            <div className="flex h-full gap-6">
              {/* LEFT - Gallery (scrollable) */}
              <div className="flex-1 overflow-y-auto pr-2">
                <GalleryGrid
                  images={images}
                  isLoading={isLoading}
                  onSelectImage={handleSelectImage}
                  onZoomImage={setPreviewImage}
                  onDeleteImage={handleDeleteImage}
                  selectedUrls={selectedUrls}
                  onToggleSelect={handleToggleSelect}
                  onBulkDelete={handleBulkDelete}
                  onClearSelection={handleClearSelection}
                />
              </div>

              {/* RIGHT - Upload (fixed) */}
              <div
                className="w-80 shrink-0 border rounded-lg p-4 bg-muted h-fit"
                ref={dropzoneRef}
              >
                <UploadDropzone onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          images={images}
          onClose={() => setPreviewImage(null)}
          onNavigate={setPreviewImage}
        />
      )}
    </div>
  );
}
