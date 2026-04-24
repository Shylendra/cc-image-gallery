# AI Build Blueprint (AISS) - Dockerized Next.js Image Gallery App

## 1. Project Overview

- Project Name: Dockerized Next.js Image Gallery
- Objective: Build a modern single-page image gallery app where users can upload, view, and preview images.
- Target Users: General users who want a simple local/private image gallery.
- App Type: Single-page full-stack Next.js application.
- Key Features:
  - Multiple image upload
  - Drag-and-drop upload
  - Responsive image gallery
  - Thumbnail display
  - Click image to open large preview/modal
  - Local file storage in date-wise folders
  - Dockerized deployment
  - Clear README and CLAUDE.md for AI-assisted development

---

## 2. Technology Stack

### Frontend
- Framework: Next.js using App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI Library: ShadCN UI
- Icons: Lucide React
- Image Handling: Next.js Image component where suitable

### Backend
- Framework: Next.js API Routes / Route Handlers
- Architecture: Monolith, with frontend and backend in the same Next.js app

### Authentication / Authorization
- Authentication: Not required for initial version
- Authorization: Not required for initial version
- Future Extension: App should be structured so authentication can be added later

### Database
- Database: Not required
- Reason: Uploaded image files are stored on the local filesystem

### File Storage
- Storage Type: Local filesystem
- Upload Base Folder inside app/container: `/app/uploads`
- Public Access Path: `/uploads`
- Date-wise Folder Structure:
  - `/app/uploads/YYYY-MM-DD/`
- File Naming Convention:
  - `timestamp_sanitized-original-filename.ext`
- Supported File Types:
  - `.jpg`
  - `.jpeg`
  - `.png`
  - `.webp`
  - `.gif`

### Docker / DevOps
- Docker: Required
- Docker Compose: Required
- Persistent Upload Storage: Required using Docker volume
- Container Port: `3000`
- Local App URL: `http://localhost:3000`

---

## 3. Core Functional Requirements

1. User can upload multiple image files.
2. User can drag and drop images into the upload area.
3. Uploaded files must be stored in date-wise folders.
4. Gallery must display uploaded images as clean thumbnails.
5. Clicking a thumbnail must open a larger preview modal/lightbox.
6. User must be able to close the preview modal.
7. Gallery must be responsive for desktop, tablet, and mobile.
8. Sidebar should be designed for future features such as albums, search, tags, favourites, or settings.
9. Header should show app name and simple actions.
10. App should not require a database.

---

## 4. UI / Layout Requirements

### Layout
- Header at the top
- Sidebar on the left
- Main gallery area on the right
- Responsive layout:
  - Desktop: Header + sidebar + gallery grid
  - Mobile: Sidebar should collapse or stack appropriately

### Design Style
- Modern
- Professional
- Minimal
- Clean spacing
- Rounded cards
- Subtle shadows
- Good empty-state design

### Main UI Sections
- Header:
  - App name
  - Optional upload button/action area
- Sidebar:
  - Placeholder navigation items:
    - Gallery
    - Uploads
    - Albums
    - Settings
- Main Area:
  - Drag-and-drop upload zone
  - Upload progress or status message
  - Gallery grid
  - Empty state when no images exist
  - Modal/lightbox image preview

---

## 5. API Requirements

### 5.1 Upload Images API

- Endpoint: `/api/upload`
- Method: `POST`
- Request Type: `multipart/form-data`
- Field Name: `files`
- Behaviour:
  - Accept multiple image files
  - Validate file type
  - Validate file size
  - Create date-wise folder if it does not exist
  - Save files to `/app/uploads/YYYY-MM-DD/`
  - Return uploaded file URLs

Example Response:

```json
{
  "success": true,
  "files": [
    {
      "fileName": "1713945600000_sample.jpg",
      "url": "/uploads/2026-04-24/1713945600000_sample.jpg"
    }
  ]
}
```

### 5.2 Get Images API

- Endpoint: `/api/images`
- Method: `GET`
- Behaviour:
  - Scan upload folder recursively
  - Return available images sorted by newest first

Example Response:

```json
{
  "success": true,
  "images": [
    {
      "fileName": "1713945600000_sample.jpg",
      "url": "/uploads/2026-04-24/1713945600000_sample.jpg",
      "uploadedDate": "2026-04-24"
    }
  ]
}
```

---

## 6. File Storage Design

### Required Folder Structure

```text
/uploads
  /YYYY-MM-DD
    timestamp_filename.jpg
```

### Important Docker Storage Requirement

Uploaded images must persist after the Docker container restarts.

Use Docker Compose volume mapping:

```yaml
volumes:
  - ./uploads:/app/uploads
```

The app must read and write uploaded files from `/app/uploads`.

---

## 7. Security Requirements

- Accept only image file types.
- Reject executable or unsupported files.
- Enforce maximum file size, for example 5MB or 10MB per file.
- Sanitize file names.
- Prevent path traversal attacks.
- Avoid overwriting existing files.
- Add server-side validation, not only frontend validation.
- Return clear error messages for invalid uploads.

---

## 8. Non-Functional Requirements

- Performance:
  - Use thumbnails or optimized rendering where possible.
  - Lazy load gallery images where appropriate.
- Scalability:
  - Use modular components.
  - Keep upload logic separate in utility functions.
- Maintainability:
  - Clear folder structure.
  - Meaningful component names.
  - Reusable UI components.
- Logging:
  - Add basic server-side logging for upload success/failure.
- Error Handling:
  - User-friendly frontend error messages.
  - Structured API error responses.

---

## 9. Suggested Project Structure

```text
image-gallery-app/
  app/
    api/
      images/
        route.ts
      upload/
        route.ts
    page.tsx
    layout.tsx
    globals.css
  components/
    layout/
      app-header.tsx
      app-sidebar.tsx
      app-shell.tsx
    gallery/
      gallery-grid.tsx
      image-card.tsx
      image-preview-modal.tsx
      upload-dropzone.tsx
  lib/
    file-storage.ts
    validations.ts
    utils.ts
  public/
  uploads/
  Dockerfile
  docker-compose.yml
  .dockerignore
  .env.example
  CLAUDE.md
  README.md
  package.json
  next.config.ts
  tsconfig.json
```

---

## 10. Docker Requirements

### Dockerfile
Create a production-ready Dockerfile for Next.js.

Requirements:
- Use Node.js LTS image
- Install dependencies
- Build the Next.js app
- Run in production mode
- Expose port `3000`
- Ensure upload folder exists
- Do not copy unnecessary files into the image

### docker-compose.yml
Create Docker Compose file.

Requirements:
- Service name: `image-gallery-app`
- Map port `3000:3000`
- Mount local `./uploads` folder to container `/app/uploads`
- Use restart policy unless stopped

Example expectation:

```yaml
services:
  image-gallery-app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

### .dockerignore
Include:
```text
node_modules
.next
.git
.env
uploads
```

---

## 11. README.md Requirements

Create a clear README.md with:

1. Project overview
2. Features
3. Tech stack
4. Folder structure
5. Local development setup
6. Docker setup
7. Docker Compose commands
8. Upload storage explanation
9. API endpoint documentation
10. Future enhancement ideas

### Required README Commands

```bash
npm install
npm run dev
```

```bash
docker compose up --build
```

```bash
docker compose down
```

---

## 12. CLAUDE.md Requirements

Create a `CLAUDE.md` file to guide Claude Code.

The file must include:

1. Project purpose
2. Tech stack
3. Architecture summary
4. Important folders
5. Coding standards
6. How uploads work
7. Docker requirements
8. Do not use a database
9. Do not introduce authentication unless explicitly requested
10. Preferred implementation approach

### Required CLAUDE.md Instruction

Claude Code must follow these rules:

```text
- Use Next.js App Router with TypeScript.
- Use ShadCN UI and Tailwind CSS for UI.
- Store uploaded files only in the local filesystem.
- Do not add a database.
- Do not add authentication unless requested.
- Keep the app modular and easy to extend.
- Ensure Docker and Docker Compose work correctly.
- Ensure uploaded images persist through Docker volume mapping.
- Update README.md whenever setup or commands change.
```

---

## 13. AI Coding Agent Instructions

When using this specification with Claude Code, Cursor, or similar tools:

- Generate a complete working Next.js project.
- Use production-quality code.
- Use TypeScript strictly.
- Use reusable components.
- Use ShadCN UI components where appropriate.
- Implement drag-and-drop upload.
- Implement backend upload API.
- Implement gallery fetch API.
- Implement Dockerfile.
- Implement docker-compose.yml.
- Implement README.md.
- Implement CLAUDE.md.
- Include error handling and validations.
- Keep code clean and easy to extend.
- Do not use a database.
- Do not use cloud storage.
- Do not add authentication in the initial version.

---

## 14. Acceptance Criteria

The build is complete when:

1. App runs locally with `npm run dev`.
2. App runs with `docker compose up --build`.
3. User can upload multiple images.
4. User can drag and drop images.
5. Uploaded images are saved in date-wise folders.
6. Uploaded images persist after Docker container restart.
7. Gallery displays uploaded image thumbnails.
8. Clicking an image opens a large preview.
9. UI looks modern and professional.
10. README.md is complete.
11. CLAUDE.md is complete.
12. No database is used.

---

## 15. Future Enhancements

Possible future features:
- Albums
- Tags
- Search
- Favourites
- Image delete option
- Image metadata
- Authentication
- Cloud storage such as S3
- Admin dashboard
- Pagination or infinite scroll
