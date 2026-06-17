# Supabase setup

The app is already migrated to Postgres (Prisma provider `postgresql`, real enums, a
Postgres init migration in `prisma/migrations/`). This guide is the remaining manual
part: create a Supabase database and point the app at it. ~5 minutes.

## 1. Create a Supabase project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. Choose a region close to you and set a strong **database password** (save it).
3. Wait for the project to finish provisioning.

## 2. Get the connection strings

In the dashboard: **Connect** (top bar) → **ORMs** tab → **Prisma**, or
**Project Settings → Database → Connection string**. You need two URLs:

| Env var | Which string | Port | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Transaction pooler** (PgBouncer) | `6543` | append `?pgbouncer=true` |
| `DIRECT_URL` | **Direct connection** | `5432` | used only by Prisma Migrate |

Replace `[YOUR-PASSWORD]` with the password from step 1. They look like:

```
DATABASE_URL="postgresql://postgres.abcdxyz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdxyz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

> Why two URLs: the app runs through the **pooler** (handles many short-lived
> serverless connections), while Prisma Migrate needs a **direct** connection to run DDL.
> This is configured in `prisma/schema.prisma` (`url` + `directUrl`).

## 3. Configure `.env`

Copy the template and fill it in:

```bash
cp .env.example .env
```

Set `DATABASE_URL` and `DIRECT_URL` from step 2. Generate an `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 4. Apply the schema and seed

```bash
npm install
npx prisma migrate deploy   # applies prisma/migrations to Supabase
npm run db:seed             # loads 9 models + 16 features
```

`migrate deploy` runs the committed migration (creates the `SwipeDirection` /
`FeatureCategory` enums, all tables, indexes, and FKs). To inspect:

```bash
npm run db:studio
```

## 5. Run

```bash
npm run dev   # http://localhost:3000 — sign in with any email
```

## Deploying (e.g. Vercel)

Set the same three env vars (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`) in the host's
project settings. Run `prisma migrate deploy` as part of the build/release step. `.env`
is gitignored, so production secrets live only in the host.

## Notes / next steps

- **RLS is deferred.** Every query is scoped to the session user via Prisma, so it's safe
  for a single app server. If you later expose the DB directly (e.g. Supabase client in the
  browser), add Row Level Security. Note this app uses **Auth.js**, not Supabase Auth, so
  `auth.uid()` is not populated — RLS would key off your own user id, or you'd adopt
  Supabase Auth.
- **Schema changes:** edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <change>`
  locally against your dev database. This also regenerates `prisma/dbml/schema.dbml`
  (view with `/schema prisma/dbml/schema.dbml`).
