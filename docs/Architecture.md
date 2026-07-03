# System Architecture

The Bharat Sentinel News Portal is built on a modern Next.js 14 stack, leveraging App Router, React Server Components, and a PostgreSQL database orchestrated by Prisma ORM.

## Core Components
- **Frontend**: Next.js App Router, TailwindCSS, Lucide Icons.
- **Backend API**: Next.js Route Handlers (`/api/*`).
- **Database**: PostgreSQL.
- **Authentication**: NextAuth.js (Credentials/JWT).
- **Media Storage**: Local storage or Cloudinary (configurable).

## Data Flow
Client requests hit the Nginx reverse proxy, routing to the Next.js standalone Node server. Server components fetch data directly via Prisma, while client components mutate data via REST API hooks.