# Khabar 24 Times - Enterprise News Portal

A modern, production-ready Indian news platform built on the Next.js 14 App Router, featuring a high-velocity CMS, robust editorial workflows, and enterprise-grade SEO and security.

## Features

- **Next.js 14 App Router**: Lightning-fast server components and API routes.
- **Prisma + PostgreSQL**: Resilient relational database modeling with APM integration.
- **Editorial CMS Workflow**: Granular permission hierarchies (Admin, Editor, Reporter) governing the publication lifecycle.
- **Rich Media Library**: Centralized asset management integrating Cloudinary.
- **Advanced SEO**: Native JSON-LD, automated Sitemaps, RSS feeds, and highly optimized edge delivery.
- **Observability**: Built-in system health checks, JSON structured logging, and slow-query detection.

## Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: TailwindCSS & Lucide React
- **Authentication**: NextAuth.js
- **Testing**: Playwright E2E

## Architecture
\`\`\`mermaid
graph TD
    Client[Browser/PWA] --> Proxy[Nginx Reverse Proxy]
    Proxy --> NextJS[Next.js App Router]
    NextJS --> Auth[NextAuth.js]
    NextJS --> Services[Internal Services]
    Services --> DB[(PostgreSQL)]
\`\`\`

## Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/organization/news-portal.git
   cd news-portal
   \`\`\`

2. **Install Dependencies:**
   \`\`\`bash
   npm ci
   \`\`\`

3. **Configure Environment:**
   Copy `.env.example` to `.env` and fill the variables.
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. **Initialize Database:**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

5. **Run Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment

Refer to the complete `docs/Deployment.md` guide. The project includes a multi-stage Dockerfile and a production-grade Nginx configuration out-of-the-box.
Run:
\`\`\`bash
docker-compose up -d --build
\`\`\`

## Documentation

Full architectural guides, testing plans, and user manuals are available in the [`docs/`](./docs/) directory.

## Testing

Run Playwright End-to-End tests:
\`\`\`bash
npx playwright test
\`\`\`

## License

MIT License. See [LICENSE](LICENSE) for details.
