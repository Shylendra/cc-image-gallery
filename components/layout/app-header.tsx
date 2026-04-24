'use client';

import { Images, Menu, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onMenuToggle: () => void;
  onUploadClick: () => void;
}

export default function AppHeader({ onMenuToggle, onUploadClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <Menu />
      </Button>

      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Images className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Image Gallery</span>
      </div>

      <div className="ml-auto">
        <Button size="sm" onClick={onUploadClick} className="gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload Photos</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>
    </header>
  );
}
