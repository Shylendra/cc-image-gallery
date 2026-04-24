import fs from 'fs/promises';
import path from 'path';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function getUploadBase(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'uploads');
}

export function getTodayFolder(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(getUploadBase(), today);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export function sanitizeFileName(name: string): string {
  // Strip directory separators and null bytes, collapse dangerous patterns
  return name
    .replace(/[/\\]/g, '_')
    .replace(/\0/g, '')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 200); // hard cap
}

export function generateFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, path.extname(originalName));
  const sanitizedBase = sanitizeFileName(baseName);
  return `${Date.now()}_${sanitizedBase}${ext}`;
}

export function getPublicUrl(absoluteFilePath: string): string {
  const base = getUploadBase();
  const relative = path.relative(base, absoluteFilePath).replace(/\\/g, '/');
  return `/uploads/${relative}`;
}

export interface ImageInfo {
  fileName: string;
  url: string;
  uploadedDate: string;
}

export async function listAllImages(): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  const base = getUploadBase();

  try {
    const entries = await fs.readdir(base, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const dateDir = entry.name;
      // Validate it looks like a date folder YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateDir)) continue;

      const datePath = path.join(base, dateDir);
      const files = await fs.readdir(datePath);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) continue;

        images.push({
          fileName: file,
          url: `/uploads/${dateDir}/${file}`,
          uploadedDate: dateDir,
        });
      }
    }
  } catch {
    return [];
  }

  // Sort newest date first; within same date, newest timestamp first
  images.sort((a, b) => {
    if (a.uploadedDate !== b.uploadedDate) {
      return b.uploadedDate.localeCompare(a.uploadedDate);
    }
    return b.fileName.localeCompare(a.fileName);
  });

  return images;
}

export function isPathSafe(filePath: string): boolean {
  const base = path.resolve(getUploadBase());
  const resolved = path.resolve(filePath);
  return resolved.startsWith(base + path.sep) || resolved === base;
}

/** Converts a public URL like /uploads/YYYY-MM-DD/file.jpg to an absolute fs path. */
export function urlToFilePath(publicUrl: string): string {
  // Strip leading /uploads/ prefix
  const relative = publicUrl.replace(/^\/uploads\//, '');
  return path.join(getUploadBase(), ...relative.split('/'));
}

export async function deleteImageFile(publicUrl: string): Promise<void> {
  const filePath = urlToFilePath(publicUrl);

  if (!isPathSafe(filePath)) {
    throw new Error('Forbidden path.');
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Unsupported file type.');
  }

  await fs.unlink(filePath);
}
