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
    const { url } = await request.json() as { url?: string };

    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing "url" field.' },
        { status: 400 }
      );
    }

    await deleteImageFile(url);
    console.log(`[images] Deleted: ${url}`);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'Forbidden path.' || message === 'Unsupported file type.') {
      return NextResponse.json({ success: false, error: message }, { status: 403 });
    }
    console.error('[images] Delete failed:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image.' },
      { status: 500 }
    );
  }
}
