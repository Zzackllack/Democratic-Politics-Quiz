## Overview

This repository is organized as a monorepo for the Democratic Politics Quiz project. The main application is located in `applications/frontend`, which contains a Next.js + React + Tailwind CSS frontend. Other folders may exist for backend or infrastructure in the future.

> ⚠️ This project now includes a full backend based on **Express.js**, **Prisma ORM**, and a **PostgreSQL** database. AI agents and contributors should take this into account when implementing full-stack functionality or dynamic content.

### Key Folders

- `applications/frontend/` — Main Next.js frontend app
  - `src/components/` — React components (Hero, Quiz, Leaderboard, Reflection, Lobby, etc.)
  - `src/data/` — Mock data and type definitions
  - `src/pages/` — Next.js pages (routing)
  - `src/styles/` — Global CSS styles
  - `public/` — Static assets (favicons, images, etc.)
- `applications/backend/` — Express.js backend service
  - `prisma/schema.prisma` — Prisma database schema (PostgreSQL)
  - `src/` — Server logic, route handlers, mock data, database logic
  - `.example.env` — Example of required environment variables
  - `package.json`, `tsconfig.json` — Backend project configuration
- `.vscode/` — VS Code workspace settings
- `README.md` — Project overview and setup
- `startup-script.sh` — Bash script for local setup

## Contribution & Style Guidelines

- Use TypeScript for all new code in the frontend and backend.
- Prefer functional React components and hooks.
- Use Tailwind CSS utility classes for styling; avoid custom CSS unless necessary.
- Keep code modular: one component per file, colocate related types and mock data.
- Use descriptive variable and function names (English or German, but be consistent within a file).
- Write clear, concise commit messages.

### UI/UX & Design Standards

- We aim for **aesthetically pleasing UI and excellent UX**, following the **latest design trends** (e.g. soft shadows, fluid layouts, clean typography, accessible contrast).
- Use **Framer Motion** to implement smooth, modern animations — subtle but expressive. Avoid overuse of animations that could slow performance or distract the user.
- All UI must be **fully responsive and mobile-optimized**, with intuitive layout behavior across breakpoints (mobile, tablet, desktop).
- Color palettes should follow our established theme (black, red, gold/yellow, neutral gray/white), used tastefully with consistent contrast and hierarchy.
- Ensure accessibility best practices are followed (keyboard navigation, ARIA roles, screen reader compatibility).

## Backend Instructions (Express + Prisma + PostgreSQL)

If you're working on the backend or implementing functionality that connects frontend to backend (e.g. dynamic question loading, leaderboard logic), follow these instructions:

### Setup

1. Navigate to the backend folder:

   ```bash
   cd applications/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database connection by creating a `.env` file (you can use `.example.env` as a template):

   ```
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>"
   ```

4. Generate Prisma client (must be done after any schema change):

   ```bash
   npx prisma generate
   ```

5. Run migrations (after modifying schema.prisma):

   ```bash
   npx prisma migrate dev --name init
   ```

6. Optionally, seed the database using a script:

   ```bash
   npx ts-node src/seed.ts
   ```

7. Start the backend server:

   ```bash
   npm run dev
   ```

### Notes for AI Agents

- If you're generating server logic, use **Express route handlers** and connect them to Prisma client queries.
- Make sure to filter quiz questions based on parameters like difficulty, mode, and session when implementing API endpoints.
- Ensure CORS and JSON body-parsing middleware are enabled in Express if frontend is communicating with this backend.
- When suggesting backend-related commands, include Prisma steps like `npx prisma generate`, `npx prisma migrate dev`, and `.env` creation if needed.
- API routes should return meaningful status codes and error messages.
- Use TypeScript types from `@prisma/client` for consistent DB models.

## Migration Notes

- The codebase is being migrated to Next.js 15 and Tailwind CSS v4. All new pages/components should use the new app structure and conventions.
- Legacy Astro or other frameworks are not in use; ignore any references to Astro in scripts or configs.

## Validation & Testing

- Run `npm run lint` in `applications/frontend` to check code style and catch errors.
- Run `npm run format` to format code with Prettier.
- Run `npm run build` to build the application and check for TypeScript errors.
- Run `npm run dev` to start the development server and manually test UI changes.
- Add/update tests as needed (test setup may be added in the future).
- Ensure all changes build and run locally before submitting PRs.
