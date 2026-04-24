import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUploadBase, isPathSafe } from '@/lib/file-storage';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Sanitize each segment — allow only safe characters
  const clean = segments.map((seg) =>
    seg.replace(/\.\./g, '').replace(/[^a-zA-Z0-9._-]/g, '')
  );

  if (clean.some((s) => s === '')) {
    return NextResponse.json({ error: 'Invalid path.' }, { status: 400 });
  }

  const filePath = path.join(getUploadBase(), ...clean);

  // Confirm the resolved path stays inside the upload directory
  if (!isPathSafe(filePath)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_MAP[ext];
  if (!mimeType) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }
}
