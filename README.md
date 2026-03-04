# Essentials

Essentials is a daily Ramadan web quiz where users answer 5 Islamic questions (fiqh, aqeedah, seerah, and akhlaq), view their score, and share results like Wordle.

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

4. Generate Prisma client and apply schema:

```bash
bun run prisma:generate
bun run prisma:push
```

5. Seed one sample daily quiz:

```bash
bun run prisma:seed
```

Seed data is loaded from:

- `prisma/quizzes.json` (add future quizzes here)

Or run both schema + seed in one command:

```bash
bun run prisma:setup
```

6. Start the app:

```bash
bun run dev
```

## Key features included

- Daily quiz homepage (`/`) with warm Ramadan UI
- First-visit instructions modal explaining gameplay and sharing
- Prisma models for question bank, daily quizzes, and responses
- API routes:
  - `GET /api/quiz/today`
  - `POST /api/response`
  - `POST /api/admin/quizzes` (secured with `x-admin-token`)
- Admin placeholder page (`/admin`) for future dashboard expansion

## Admin API: create quiz

Set in `.env`:

```bash
ADMIN_TOKEN=\"your-secret-token\"
```

### Endpoint

- `POST /api/admin/quizzes`
- Header required: `x-admin-token: <ADMIN_TOKEN>`

### Minimal Postman JSON body

```json
{
  "title": "Ramadan Day 16",
  "releaseDate": "2026-03-05",
  "isPublished": true,
  "questions": [
    {
      "prompt": "Which intention is required before beginning the fast?",
      "topic": "fiqh",
      "options": ["Niyyah", "Wudu", "Khutbah"],
      "answerIndex": 0
    },
    {
      "prompt": "Belief in Allah's angels is part of:",
      "topic": "aqeedah",
      "options": ["Pillars of Islam", "Pillars of Iman", "Sunnah acts"],
      "answerIndex": 1
    },
    {
      "prompt": "What is the name of the migration from Makkah to Madinah?",
      "topic": "seerah",
      "options": ["Hijrah", "Isra", "Fath"],
      "answerIndex": 0
    },
    {
      "prompt": "Which action best represents amanah (trustworthiness)?",
      "topic": "akhlaq",
      "options": [
        "Returning something borrowed on time",
        "Keeping extra change by mistake",
        "Sharing private information"
      ],
      "answerIndex": 0
    },
    {
      "prompt": "What meal is recommended before Fajr during fasting?",
      "topic": "fiqh",
      "options": ["Iftar", "Suhur", "Qiyam"],
      "answerIndex": 1
    }
  ]
}
```

## Docker provisioning script

`scripts/local-db.sh` supports env overrides:

- `CONTAINER_NAME`
- `VOLUME_NAME`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `HOST_PORT`
- `POSTGRES_IMAGE`
