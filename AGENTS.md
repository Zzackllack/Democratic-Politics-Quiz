# AGENTS.md

## Overview

This repository is organized as a monorepo for the Democratic Politics Quiz project. The main application is located in `applications/frontend`, which contains a Next.js + React + Tailwind CSS frontend. Other folders may exist for backend or infrastructure in the future.

### Key Folders

- `applications/frontend/` — Main Next.js frontend app
  - `src/components/` — React components (Hero, Quiz, Leaderboard, Reflection, Lobby, etc.)
  - `src/data/` — Mock data and type definitions
  - `src/pages/` — Next.js pages (routing)
  - `src/styles/` — Global CSS styles
  - `public/` — Static assets (favicons, images, etc.)
- `.vscode/` — VS Code workspace settings
- `README.md` — Project overview and setup
- `startup-script.sh` — Bash script for local setup

## Contribution & Style Guidelines

- Use TypeScript for all new code in the frontend.
- Prefer functional React components and hooks.
- Use Tailwind CSS utility classes for styling; avoid custom CSS unless necessary.
- Keep code modular: one component per file, colocate related types and mock data.
- Use descriptive variable and function names (English or German, but be consistent within a file).
- Write clear, concise commit messages.

## Migration Notes

- The codebase is being migrated to Next.js 15 and Tailwind CSS v4. All new pages/components should use the new app structure and conventions.
- Legacy Astro or other frameworks are not in use; ignore any references to Astro in scripts or configs.

## Validation & Testing

- Run `npm run lint` in `applications/frontend` to check code style and catch errors.
- Run `npm run dev` to start the development server and manually test UI changes.
- Add/update tests as needed (test setup may be added in the future).
- Ensure all changes build and run locally before submitting PRs.

---

For any questions, refer to the main `README.md` or contact the project maintainers.
