const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

export interface FileValidationError {
  fileName: string;
  error: string;
}

export function validateMimeType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateExtension(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function validateImageFile(file: File): string | null {
  if (!validateMimeType(file.type)) {
    return `File type "${file.type}" is not allowed. Accepted: JPEG, PNG, WebP, GIF.`;
  }
  if (!validateExtension(file.name)) {
    return `File extension is not allowed. Accepted: .jpg, .jpeg, .png, .webp, .gif`;
  }
  if (!validateFileSize(file.size)) {
    const maxMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
    return `File size ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the ${maxMB} MB limit.`;
  }
  return null;
}

export function validateFiles(files: File[]): {
  valid: File[];
  errors: FileValidationError[];
} {
  const valid: File[] = [];
  const errors: FileValidationError[] = [];

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) {
      errors.push({ fileName: file.name, error });
    } else {
      valid.push(file);
    }
  }

  return { valid, errors };
}
