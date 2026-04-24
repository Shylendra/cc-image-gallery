# Image Gallery

A modern, private image gallery built with Next.js. Upload photos, browse them in a responsive grid, and preview them in a full-screen lightbox — all stored locally with no database or cloud required.

---

## Features

- **Drag-and-drop upload** — drop multiple images at once, or click to browse
- **Multiple file upload** — upload a batch in a single request
- **Responsive gallery grid** — adapts from 2 columns on mobile to 6 on wide screens
- **Date-grouped display** — images grouped by upload date, newest first
- **Full-screen preview** — click any thumbnail to open a lightbox with keyboard navigation
- **Download button** — download the original file directly from the preview
- **Persistent storage** — Docker volume mapping keeps images across restarts
- **Zero database** — everything is stored on the local filesystem

---

## Tech Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| Framework  | Next.js 15 (App Router, TypeScript)  |
| Styling    | Tailwind CSS + ShadCN UI             |
| Icons      | Lucide React                         |
| Storage    | Local filesystem (`/app/uploads`)    |
| Container  | Docker + Docker Compose              |

---

## Project Structure

```
cc-image-gallery/
├── app/
│   ├── api/
│   │   ├── images/route.ts          # GET /api/images — list all images
│   │   └── upload/route.ts          # POST /api/upload — upload images
│   ├── uploads/[...path]/route.ts   # Serve uploaded image files
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── gallery/
│   │   ├── gallery-grid.tsx
│   │   ├── image-card.tsx
│   │   ├── image-preview-modal.tsx
│   │   └── upload-dropzone.tsx
│   ├── layout/
│   │   ├── app-header.tsx
│   │   ├── app-shell.tsx
│   │   └── app-sidebar.tsx
│   └── ui/
│       ├── badge.tsx
│       └── button.tsx
├── lib/
│   ├── file-storage.ts              # Filesystem helpers
│   ├── utils.ts                     # cn(), formatFileSize(), formatDate()
│   └── validations.ts               # MIME / extension / size validation
├── uploads/                         # Created at runtime — gitignored
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── CLAUDE.md
└── README.md
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm

### Steps

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Uploaded images are saved to `./uploads/` in the project root (created automatically).

---

## Docker Setup

### Build and Start

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

### Stop

```bash
docker compose down
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

---

## Upload Storage

Images are saved at:

```
uploads/
  YYYY-MM-DD/
    <timestamp>_<sanitized-filename>.<ext>
```

In Docker, the local `./uploads` folder is mounted to `/app/uploads` inside the container via a volume:

```yaml
volumes:
  - ./uploads:/app/uploads
```

This means images **persist after container restarts**. The `uploads/` folder is not committed to git.

---

## API Reference

### `POST /api/upload`

Upload one or more image files.

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Content-Type  | `multipart/form-data`                      |
| Field name    | `files` (multiple values allowed)          |
| Accepted types | JPEG, PNG, WebP, GIF                      |
| Max file size | 10 MB per file                             |

**Response (201)**

```json
{
  "success": true,
  "files": [
    { "fileName": "1713945600000_photo.jpg", "url": "/uploads/2026-04-24/1713945600000_photo.jpg" }
  ]
}
```

**Response with partial success (201)**

```json
{
  "success": true,
  "files": [...],
  "warnings": [
    { "fileName": "bad.exe", "error": "File type is not allowed." }
  ]
}
```

---

### `GET /api/images`

List all uploaded images sorted newest first.

**Response (200)**

```json
{
  "success": true,
  "images": [
    {
      "fileName": "1713945600000_photo.jpg",
      "url": "/uploads/2026-04-24/1713945600000_photo.jpg",
      "uploadedDate": "2026-04-24"
    }
  ]
}
```

---

## Environment Variables

Copy `.env.example` to `.env.local` for local overrides:

```bash
cp .env.example .env.local
```

| Variable       | Default     | Description                        |
|----------------|-------------|------------------------------------|
| `UPLOAD_DIR`   | `./uploads` | Absolute or relative upload path   |
| `MAX_FILE_SIZE`| `10485760`  | Max bytes per file (10 MB)         |

---

## Future Enhancements

- Albums and tags
- Favourites
- Search by filename or date
- Image delete
- Pagination / infinite scroll
- Authentication
- Cloud storage (S3, R2)
- Image metadata (EXIF)
- Admin dashboard
