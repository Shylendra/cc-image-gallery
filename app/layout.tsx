import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image Gallery',
  description: 'A private local image gallery — upload, browse, and preview your photos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
