# Plascom Production MIS

Standalone daily production MIS for Plascom — four independent sheets per calendar day, five dashboards, and permanent history.

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL on Neon (Prisma)
- PWA via `@ducanh2912/next-pwa`
- Vitest for formula and workflow tests

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon connection string).
2. Install dependencies:

```bash
npm install
```

3. Push schema:

```bash
npm run db:push
```

4. Run dev server:

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Run Vitest |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync Prisma schema to database |

## Deploy (Vercel)

1. Import project and set `DATABASE_URL`.
2. Build command: `npm run build`
3. Run `npm run db:push` against production DB once after first deploy.

## Scope

This app implements only the Plascom Production MIS (no auth, RBAC, or full ERP). Structure is kept modular for future ERP integration.
