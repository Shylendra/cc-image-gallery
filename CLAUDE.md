# CLAUDE.md — Image Gallery App

## Project Purpose

A private, local image gallery built with Next.js. Users upload images, which are stored on the
local filesystem in date-wise folders. No database. No cloud. No auth in v1.

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Framework  | Next.js 15 (App Router) — TypeScript           |
| Styling    | Tailwind CSS + ShadCN UI primitives            |
| Icons      | Lucide React                                   |
| Storage    | Local filesystem at `/app/uploads` in Docker   |
| Container  | Docker + Docker Compose                        |

---

## Architecture Summary

- **Monolith**: frontend and backend live in the same Next.js app.
- **App Router** with server and client components as appropriate.
- **Route handlers** (`app/api/**`) serve the upload and image-listing APIs.
- **File serving**: uploaded images are served via `app/uploads/[...path]/route.ts`,
  which reads from the filesystem and applies path-traversal protection.

---

## Important Folders

```
app/
  api/upload/route.ts        — POST: accept multipart uploads, save files
  api/images/route.ts        — GET:  list all images sorted newest first
  uploads/[...path]/route.ts — GET:  serve uploaded image files securely
  layout.tsx / page.tsx      — root layout and entry point

components/
  layout/
    app-shell.tsx            — client root: state, layout orchestration
    app-header.tsx           — top bar with app name + upload button
    app-sidebar.tsx          — nav sidebar (future features as placeholders)
  gallery/
    gallery-grid.tsx         — responsive image grid grouped by date
    image-card.tsx           — thumbnail card with hover overlay
    image-preview-modal.tsx  — full-screen lightbox with keyboard nav
    upload-dropzone.tsx      — drag-and-drop upload with status tracking
  ui/
    button.tsx / badge.tsx   — ShadCN-style primitives

lib/
  file-storage.ts            — filesystem helpers (paths, listing, sanitization)
  validations.ts             — MIME type + extension + size validation
  utils.ts                   — cn(), formatFileSize(), formatDate()
```

---

## Coding Standards

- **TypeScript strict mode** — no `any`, no `as unknown`.
- **No comments** unless the WHY is non-obvious.
- **No database** — all persistence is the local filesystem.
- **No authentication** unless explicitly requested.
- Use `cn()` from `lib/utils.ts` for className merging.
- Components live in `components/`; logic lives in `lib/`.
- Keep API route handlers thin — delegate to `lib/` functions.

---

## How Uploads Work

1. User drops files or clicks the dropzone → `UploadDropzone` sends `FormData` to `POST /api/upload`.
2. Route handler reads `formData.getAll('files')`, validates MIME type + extension + size.
3. Valid files are written to `/app/uploads/YYYY-MM-DD/<timestamp>_<sanitized-name>.<ext>`.
4. The response includes the public URL for each saved file.
5. `GET /api/images` scans the upload directory recursively and returns all images newest-first.
6. Images are served via the catch-all `app/uploads/[...path]/route.ts` with cache headers.

---

## File Naming Convention

```
<unix-timestamp-ms>_<sanitized-original-name>.<ext>
```

Sanitization strips `..`, path separators, null bytes, and non-ASCII characters.

---

## Docker Requirements

- `output: 'standalone'` is set in `next.config.ts` — the Dockerfile uses the standalone bundle.
- The `uploads/` folder **must** be mounted as a Docker volume to persist across container restarts:
  ```yaml
  volumes:
    - ./uploads:/app/uploads
  ```
- The container runs as a non-root user (`nextjs:nodejs`).
- Port: `3000`.

---

## Security Constraints

- Accept only: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Reject files over 10 MB.
- Sanitize file names server-side (do not trust client-provided names).
- The file-serving route validates that the resolved path stays inside the upload directory before reading.
- No path traversal is possible — each segment is filtered to `[a-zA-Z0-9._-]` before joining.

---

## Rules for Claude Code

- Use Next.js App Router with TypeScript.
- Use ShadCN UI and Tailwind CSS for UI.
- Store uploaded files only in the local filesystem — never cloud storage.
- Do not add a database.
- Do not add authentication unless explicitly requested.
- Keep the app modular and easy to extend.
- Ensure Docker and Docker Compose work correctly.
- Ensure uploaded images persist through Docker volume mapping.
- Update README.md whenever setup or commands change.
