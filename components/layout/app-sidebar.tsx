'use client';

import { useEffect, useState } from 'react';
import { Images, Upload, BookImage, Settings, Star, X, ZoomIn, Trash2, Copy, Check } from 'lucide-react';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageData } from '@/lib/types';

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  soon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Images,     label: 'Gallery',    active: true },
  { icon: Upload,     label: 'Uploads' },
  { icon: Star,       label: 'Favourites', soon: true },
  { icon: BookImage,  label: 'Albums',     soon: true },
  { icon: Settings,   label: 'Settings',   soon: true },
];

const FILE_TYPE_LABELS: Record<string, string> = {
  '.jpg':  'JPEG Image',
  '.jpeg': 'JPEG Image',
  '.png':  'PNG Image',
  '.webp': 'WebP Image',
  '.gif':  'GIF Image',
};

function getFileType(fileName: string): string {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return FILE_TYPE_LABELS[ext] ?? 'Image';
}

interface ImageDetails {
  size: string | null;
  dimensions: string | null;
}

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  selectedImage: ImageData | null;
  onClearSelection: () => void;
  onOpenPreview: (image: ImageData) => void;
  onDeleteImage: (image: ImageData) => Promise<void>;
}

export default function AppSidebar({
  open,
  onClose,
  selectedImage,
  onClearSelection,
  onOpenPreview,
  onDeleteImage,
}: AppSidebarProps) {
  const [details, setDetails] = useState<ImageDetails>({ size: null, dimensions: null });
  const [copied, setCopied] = useState(false);

  // Fetch file size + decode dimensions whenever the selected image changes
  useEffect(() => {
    if (!selectedImage) {
      setDetails({ size: null, dimensions: null });
      return;
    }

    setDetails({ size: null, dimensions: null });

    // File size via HEAD request (Content-Length header set by the serving route)
    fetch(selectedImage.url, { method: 'HEAD' })
      .then((res) => {
        const len = res.headers.get('content-length');
        if (len) {
          setDetails((prev) => ({ ...prev, size: formatFileSize(parseInt(len, 10)) }));
        }
      })
      .catch(() => {});

    // Pixel dimensions via a hidden Image element
    const img = new window.Image();
    img.onload = () => {
      setDetails((prev) => ({
        ...prev,
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
      }));
    };
    img.src = selectedImage.url;
  }, [selectedImage?.url]);

  async function handleCopyUrl() {
    if (!selectedImage) return;
    await navigator.clipboard.writeText(window.location.origin + selectedImage.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 lg:hidden">
          <span className="font-semibold">Navigation</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav className="space-y-1 px-3 py-4">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Library
            </p>
            {NAV_ITEMS.map(({ icon: Icon, label, active, soon }) => (
              <button
                key={label}
                disabled={soon}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  soon && 'cursor-not-allowed opacity-60'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
                {soon && (
                  <Badge variant="outline" className="ml-auto px-1.5 py-0 text-[10px]">
                    Soon
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* ── Image detail panel ── */}
          {selectedImage && (
            <div className="mx-3 mb-4 overflow-hidden rounded-xl border border-border bg-background">

              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Image Details
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={onClearSelection}
                  aria-label="Close details"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Thumbnail */}
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.fileName}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Metadata rows */}
              <dl className="divide-y divide-border text-xs">
                <DetailRow label="Name">
                  <span className="break-all text-foreground" title={selectedImage.fileName}>
                    {selectedImage.fileName}
                  </span>
                </DetailRow>

                <DetailRow label="Type">
                  <span className="text-foreground">{getFileType(selectedImage.fileName)}</span>
                </DetailRow>

                <DetailRow label="Size">
                  {details.size
                    ? <span className="text-foreground">{details.size}</span>
                    : <span className="text-muted-foreground italic">Loading…</span>}
                </DetailRow>

                <DetailRow label="Dimensions">
                  {details.dimensions
                    ? <span className="text-foreground">{details.dimensions}</span>
                    : <span className="text-muted-foreground italic">Loading…</span>}
                </DetailRow>

                <DetailRow label="Uploaded">
                  <span className="text-foreground">{formatDate(selectedImage.uploadedDate)}</span>
                </DetailRow>

                <DetailRow label="Path">
                  <span className="break-all font-mono text-[10px] text-muted-foreground">
                    {selectedImage.url}
                  </span>
                </DetailRow>
              </dl>

              {/* Copy URL */}
              <div className="border-t border-border px-3 py-2">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Full URL
                </p>
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground">
                    {typeof window !== 'undefined' ? window.location.origin : ''}
                    {selectedImage.url}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Copy URL"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 border-t border-border px-3 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  onClick={() => onOpenPreview(selectedImage)}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  Open preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDeleteImage(selectedImage)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete image
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-4 py-4">
          <p className="text-xs text-muted-foreground">
            Local private gallery. No cloud. No database.
          </p>
        </div>
      </aside>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 px-3 py-2">
      <dt className="w-20 shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground pt-px">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
