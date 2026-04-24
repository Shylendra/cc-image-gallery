'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ImageData } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  image: ImageData;
  images: ImageData[];
  onClose: () => void;
  onNavigate: (image: ImageData) => void;
}

export default function ImagePreviewModal({
  image,
  images,
  onClose,
  onNavigate,
}: ImagePreviewModalProps) {
  const currentIndex = images.findIndex((img) => img.url === image.url);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(images[currentIndex - 1]);
  }, [hasPrev, images, currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(images[currentIndex + 1]);
  }, [hasNext, images, currentIndex, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${image.fileName}`}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close preview"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Download button */}
      <a
        href={image.url}
        download={image.fileName}
        className="absolute right-16 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        onClick={(e) => e.stopPropagation()}
        aria-label="Download image"
      >
        <Download className="h-5 w-5" />
      </a>

      {/* Previous button */}
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 z-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {/* Next button */}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 z-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}

      {/* Image */}
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.fileName}
          className="max-h-[85vh] max-w-[88vw] rounded-lg object-contain shadow-2xl animate-slide-up"
        />
      </div>

      {/* Bottom info bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-6 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="truncate text-sm font-medium text-white/90">{image.fileName}</p>
          <p className="text-xs text-white/50">{formatDate(image.uploadedDate)}</p>
        </div>
        <p className="text-xs text-white/40">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
