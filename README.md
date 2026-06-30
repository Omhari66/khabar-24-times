# Newsroom CMS (News Portal)

A modern, role-based Newsroom Content Management System (CMS) built with Next.js 14, React, Tailwind CSS, Prisma, PostgreSQL, and NextAuth. It features a rich-text article editor (TipTap), image uploads (Cloudinary), and a robust editorial workflow.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):**
    *   **Reporter:** Create, edit, and save drafts of articles, upload cover images, and submit them for review.
    *   **Editor:** Review submitted articles, publish them, or reject them with feedback notes.
    *   **Admin:** Oversee users, assign roles, and manage the platform.
*   **Rich Text Editor (TipTap Integration):** Advanced WYSIWYG editor supporting links, colors, text alignment, YouTube video embeds, highlights, underlines, and character counting.
*   **Media Uploads:** Seamless cover image uploads integrated directly with Cloudinary.
*   **Robust Workflow Statuses:** `DRAFT` ➔ `PENDING` ➔ `PUBLISHED` / `REJECTED` (with revision notes).
*   **Responsive Dashboard:** Premium modern UI built with Tailwind CSS, offering dedicated workspaces for Reporters, Editors, and Admins.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** PostgreSQL
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (using Credentials Provider)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Rich-Text Editing:** [TipTap Editor](https://tiptap.dev/)
*   **Cloud Storage:** [Cloudinary](https://cloudinary.com/) (for cover images)

---

## 🗄️ Database Models

The schema consists of the following primary models:

*   **User:** Contains account details, role (`REPORTER`, `EDITOR`, `ADMIN`), and references to authored articles.
*   **Category:** Dynamically groups articles (e.g., Politics, Sports, Tech).
*   **Article:** Manages content (stored as JSON from TipTap), slug, status (`DRAFT`, `PENDING`, `PUBLISHED`, `REJECTED`), rejection notes, timestamps, author, and category relationships.

---

## ⚙️ Getting Started

Follow these steps to get your local development environment set up:

### Prerequisites
*   Node.js (v18.x or later)
*   PostgreSQL database instance
*   Cloudinary Account (for image uploads)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd news-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory (based on your configuration) and add the following keys:
```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/newsroom_db?schema=public"

# Next Auth secret & URL
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Setup Database & Prisma
Run the Prisma migrations to create the database tables and seed initial data:
```bash
# Run migrations
npx prisma migrate dev --name init

# Run seed script (if configured)
npx prisma db seed
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📈 Scripts

*   `npm run dev` - Starts the development server.
*   `npm run build` - Builds the application for production.
*   `npm run start` - Starts the built production server.
*   `npm run lint` - Runs ESLint to check for code quality issues.
