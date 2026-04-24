import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  getTodayFolder,
  ensureDir,
  generateFileName,
  getPublicUrl,
} from '@/lib/file-storage';
import { validateFiles } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid multipart form data.' },
        { status: 400 }
      );
    }

    const rawFiles = formData.getAll('files');
    const files = rawFiles.filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided. Send files via the "files" field.' },
        { status: 400 }
      );
    }

    const { valid, errors } = validateFiles(files);

    if (valid.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All files failed validation.', details: errors },
        { status: 422 }
      );
    }

    const todayFolder = getTodayFolder();
    await ensureDir(todayFolder);

    const uploaded: { fileName: string; url: string }[] = [];

    for (const file of valid) {
      const fileName = generateFileName(file.name);
      const filePath = path.join(todayFolder, fileName);

      // Avoid overwriting an existing file (timestamp collision is extremely rare but safe to guard)
      let finalPath = filePath;
      let counter = 1;
      while (true) {
        try {
          await fs.access(finalPath);
          // File exists — append counter
          const ext = path.extname(fileName);
          const base = path.basename(fileName, ext);
          finalPath = path.join(todayFolder, `${base}_${counter}${ext}`);
          counter++;
        } catch {
          break; // File does not exist — safe to write
        }
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(finalPath, buffer);

      const url = getPublicUrl(finalPath);
      uploaded.push({ fileName: path.basename(finalPath), url });

      console.log(`[upload] Saved ${path.basename(finalPath)} (${(file.size / 1024).toFixed(1)} KB)`);
    }

    const response: {
      success: boolean;
      files: typeof uploaded;
      warnings?: typeof errors;
    } = { success: true, files: uploaded };

    if (errors.length > 0) {
      response.warnings = errors;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('[upload] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
