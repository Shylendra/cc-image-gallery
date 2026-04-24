'use client';

import { useState } from 'react';
import { Trash2, ZoomIn, Check } from 'lucide-react';
import { ImageData } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface ImageCardProps {
  image: ImageData;
  onSelect: (image: ImageData) => void;
  onZoom: (image: ImageData) => void;
  onDelete: (image: ImageData) => Promise<void>;
  isSelected: boolean;
  onToggleSelect: (url: string) => void;
}

export default function ImageCard({
  image,
  onSelect,
  onZoom,
  onDelete,
  isSelected,
  onToggleSelect,
}: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(image);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={() => onSelect(image)}
      className={cn(
        'group relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-sm ring-1 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'ring-2 ring-primary ring-offset-2'
          : 'ring-border/50 hover:ring-2 hover:ring-primary/50'
      )}
      aria-label={`View details for ${image.fileName}`}
      aria-pressed={isSelected}
    >
      {/* Skeleton */}
      {!loaded && !error && <div className="absolute inset-0 animate-pulse bg-muted" />}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Failed to load</span>
        </div>
      )}

      {/* Image */}
      {!error && (
        <img
          src={image.url}
          alt={image.fileName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Hover / selection overlay */}
      <div className={cn(
        'absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-200',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}>
        {/* Top row: checkbox (left) + zoom/delete (right) */}
        <div className="flex items-start justify-between p-2">
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(image.url); }}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all backdrop-blur-sm',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-white/70 bg-black/40 text-white'
            )}
            aria-label={isSelected ? `Deselect ${image.fileName}` : `Select ${image.fileName}`}
          >
            {isSelected && <Check className="h-3.5 w-3.5" />}
          </button>

          {/* Zoom + delete */}
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onZoom(image); }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
              aria-label={`Preview ${image.fileName}`}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
              aria-label={`Delete ${image.fileName}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* File info — bottom */}
        <div className="p-3">
          <p className="truncate text-xs font-medium text-white/90">{image.fileName}</p>
          <p className="text-[11px] text-white/60">{formatDate(image.uploadedDate)}</p>
        </div>
      </div>

      {/* Deleting overlay */}
      {deleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}
    </button>
  );
}
