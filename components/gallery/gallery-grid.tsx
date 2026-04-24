'use client';

import { Images, Trash2, X } from 'lucide-react';
import { ImageData } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ImageCard from './image-card';

interface GalleryGridProps {
  images: ImageData[];
  isLoading: boolean;
  onSelectImage: (image: ImageData) => void;
  onZoomImage: (image: ImageData) => void;
  onDeleteImage: (image: ImageData) => Promise<void>;
  selectedUrls: Set<string>;
  onToggleSelect: (url: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function GalleryGrid({
  images,
  isLoading,
  onSelectImage,
  onZoomImage,
  onDeleteImage,
  selectedUrls,
  onToggleSelect,
  onBulkDelete,
  onClearSelection,
}: GalleryGridProps) {
  if (isLoading) {
    return (
      <section>
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-muted"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Images className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No photos yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Upload your first photo using the dropzone or the Upload Photos button.
        </p>
      </section>
    );
  }

  const grouped = images.reduce<Record<string, ImageData[]>>((acc, img) => {
    (acc[img.uploadedDate] ??= []).push(img);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const count = selectedUrls.size;

  return (
    <section className="space-y-4">
      {/* Bulk action bar */}
      {count > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-primary/20 bg-primary px-4 py-2.5 shadow-lg animate-slide-up">
          <span className="text-sm font-medium text-primary-foreground">
            {count} {count === 1 ? 'image' : 'images'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 gap-1.5 text-primary-foreground/80 hover:bg-white/20 hover:text-primary-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onBulkDelete}
              className="h-8 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {count} {count === 1 ? 'image' : 'images'}
            </Button>
          </div>
        </div>
      )}

      {/* Date groups */}
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">{formatDate(date)}</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {grouped[date].length} {grouped[date].length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {grouped[date].map((image) => (
              <ImageCard
                key={image.url}
                image={image}
                onSelect={onSelectImage}
                onZoom={onZoomImage}
                onDelete={onDeleteImage}
                isSelected={selectedUrls.has(image.url)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
