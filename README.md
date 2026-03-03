# Essentials

Essentials is a daily Ramadan web quiz where users answer 3 Islamic questions (fiqh and aqeedah), view their score, and share results like Wordle.

## Stack

- Bun
- Next.js (App Router, TypeScript)
- Shadcn-style UI components with Tailwind CSS
- Prisma ORM
- PostgreSQL (Docker)

## Quick start

1. Install dependencies:

```bash
bun install
```

2. Provision PostgreSQL in Docker with a persistent volume:

```bash
./scripts/local-db.sh
```

3. Create your env file:

```bash
cp .env.example .env
```

4. Generate Prisma client and run migrations:

```bash
bun run prisma:generate
bun run prisma:migrate --name init
```

5. Seed one sample daily quiz:

```bash
bun run prisma:seed
```

6. Start the app:

```bash
bun run dev
```

## Key features included

- Daily quiz homepage (`/`) with 3-question warm Ramadan UI
- First-visit instructions modal explaining gameplay and sharing
- Prisma models for question bank, daily quizzes, and responses
- API routes:
  - `GET /api/quiz/today`
  - `POST /api/response`
- Admin placeholder page (`/admin`) for future dashboard expansion

## Docker provisioning script

`scripts/local-db.sh` supports env overrides:

- `CONTAINER_NAME`
- `VOLUME_NAME`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `HOST_PORT`
- `POSTGRES_IMAGE`
