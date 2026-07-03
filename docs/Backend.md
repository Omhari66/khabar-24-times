# Backend Documentation

## Overview
The backend is strictly composed of Next.js Route Handlers (`src/app/api/...`) and abstracted Services (`src/lib/services/...`).

## Prisma ORM
Database operations are centralized in `src/lib/prisma.ts`. An APM extension monitors query execution time, logging any queries taking > 500ms.

## File Uploads
Handled by `/api/upload-signature` (if using Cloudinary) or custom multipart parsing for local media.