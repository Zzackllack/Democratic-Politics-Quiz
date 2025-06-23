# Democratic Politics Quiz Backend

This is the Express.js + Prisma backend for the Democratic Politics Quiz project. It provides REST APIs and WebSocket events used by the Next.js frontend located in `../frontend`.

## Requirements

- Node.js 18+
- PostgreSQL database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file based on `.example.env` and adjust the `DATABASE_URL` and `PORT` values.
3. Generate the Prisma client and validate the schema:

   ```bash
   npx prisma validate
   npx prisma generate
   ```

4. Run the initial migration (creates the tables defined in `prisma/schema.prisma`):

   ```bash
   npx prisma migrate dev --name init
   ```

5. (Optional) Seed the database with demo questions and game modes:

   ```bash
   npx ts-node src/seed.ts
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

The server listens on the port defined in `.env` (default `3001`).

## Available Scripts

- `npm run dev` – start the server with hot reload using `ts-node-dev`.
- `npm run start` – run the compiled server.
- `npm run build` – compile TypeScript to `dist/`.
- `npm run seed` – run `prisma/seed.ts` to seed the database.
- `npm run db:migrate` – run migrations.

## API Overview

- `GET /api/questions` – Retrieve quiz questions (filter by `difficulty` and `type`).
- `GET /api/players` – Leaderboard data.
- `POST /api/players` – Add or update a player score.
- `GET /api/game-modes` – List available game modes.
- Additional multiplayer endpoints exist under `/api/lobbies` and `/api/games`.
- `GET /health` – Simple health check used for container monitoring.

The WebSocket server is available on the same port and is used for lobby and game events.
