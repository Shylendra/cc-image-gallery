import { NextRequest, NextResponse } from 'next/server';
import { listAllImages, deleteImageFile } from '@/lib/file-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await listAllImages();
    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error('[images] Failed to list images:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load images.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json() as { url?: string; urls?: string[] };

    // Accept a single url or an array of urls
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : body.url
      ? [body.url]
      : [];

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Provide "url" or "urls" field.' },
        { status: 400 }
      );
    }

    const invalid = urls.find((u) => typeof u !== 'string' || !u.startsWith('/uploads/'));
    if (invalid) {
      return NextResponse.json(
        { success: false, error: `Invalid url: ${invalid}` },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(urls.map((u) => deleteImageFile(u)));

    const failed = results
      .map((r, i) => (r.status === 'rejected' ? urls[i] : null))
      .filter(Boolean);

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') console.log(`[images] Deleted: ${urls[i]}`);
      else console.error(`[images] Failed to delete ${urls[i]}:`, r.reason);
    });

    if (failed.length === urls.length) {
      return NextResponse.json(
        { success: false, error: 'All deletions failed.', failed },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: urls.length - failed.length, failed });
  } catch (err: unknown) {
    console.error('[images] Delete failed:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image(s).' },
      { status: 500 }
    );
  }
}
