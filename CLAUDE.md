# CLAUDE.md

## Project: Tinder for AI Models

A Tinder-style app where users swipe through **LLM models** (cards) instead of people.
- **Swipe left** → reject; the model never appears again for that user.
- **Swipe right** → "compatible"; the model shows up in the user's **Matches** list.
- **Phase 2** → users set AI **preferences**; cards highlight which preferences match.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack) + TypeScript + React 19
- **Styling/Gestures**: Tailwind CSS v4 (CSS-first, no `tailwind.config`) + framer-motion (drag-to-swipe)
- **ORM**: Prisma 5
- **Database**: **Supabase (Postgres)** in all environments. `DATABASE_URL` = pooled
  (PgBouncer :6543); `DIRECT_URL` = direct (:5432) for migrations. See `SUPABASE.md`.
- **Auth**: Auth.js (NextAuth v5) with Prisma adapter, JWT sessions.
  - **Google OAuth** — enabled when `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are set
    (see `GOOGLE_OAUTH.md`).
  - **Dev login** — passwordless Credentials provider (enter any email) for local use
    with zero setup. Both providers coexist; remove the dev login for production.
- **Model catalog**: seeded static list of real LLMs (`prisma/seed.ts`)

> ⚠️ Next.js 16 + Tailwind v4 differ from older conventions (see `AGENTS.md`). Before
> writing framework code, consult the bundled docs in `node_modules/next/dist/docs/`.
> Notably: `cookies()`/`headers()` are async; Server Actions use `'use server'`.

## Architecture
- Server Components fetch the deck and matches.
- A client `SwipeCard`/`SwipeDeck` handles the drag gesture.
- **Server Actions** (`app/actions/swipe.ts`) record swipes and unmatches.
- **Deck query**: show `AiModel`s the current user has NOT swiped yet.
- **Matches** = the user's `Swipe` rows with `direction = RIGHT` (derived, no Match table).
- **Preferences**: `UserPreference` rows (feature ids). Swipe cards & matches highlight
  features whose `key` is in the user's preferred set and show a match count.

## Directory Layout
```
app/page.tsx              # redirects to /swipe or /sign-in
app/sign-in/page.tsx      # dev login (server action -> signIn)
app/swipe/page.tsx        # deck (server component) -> <SwipeDeck>
app/matches/page.tsx      # right-swiped models + Unmatch + pref highlight
app/preferences/page.tsx  # pick desired features
app/actions/swipe.ts      # 'use server' recordSwipe / unmatch
app/actions/preferences.ts# 'use server' togglePreference
app/api/auth/[...nextauth]/route.ts
components/SwipeDeck.tsx   # client: stack state + optimistic swipe
components/SwipeCard.tsx   # client: framer-motion draggable card (forwardRef.fly) + pref highlight
components/PreferenceChips.tsx # client: optimistic toggle chips
components/Nav.tsx         # server: session-aware nav + sign out
lib/prisma.ts  lib/auth.ts  types/next-auth.d.ts
prisma/schema.prisma  prisma/seed.ts
```

## Data Models
Auth.js tables: `User`, `Account`, `Session`, `VerificationToken`.

- **AiModel** — card: name, provider, tagline, description, avatarUrl, contextWindow,
  input/output pricing, releaseDate; has many `AiModelFeature`.
- **Feature** — normalized capability (`key`, `label`, `category`:
  MODALITY|CAPABILITY|DEPLOYMENT|PRICING|CONTEXT).
- **AiModelFeature** — join table (AiModel ↔ Feature), composite PK.
- **Swipe** — `userId`, `aiModelId`, `direction` (enum SwipeDirection), unique per (user, model).
  Right swipes are the user's matches.
- **UserPreference** *(phase 2)* — `userId`, `featureId`, `importance`; unique per (user, feature).
- Enums **SwipeDirection** { LEFT, RIGHT } and **FeatureCategory**
  { MODALITY, CAPABILITY, DEPLOYMENT, PRICING, CONTEXT } — real Postgres enums.

## Conventions
- TypeScript strict mode.
- Prisma client is a singleton in `lib/prisma.ts` (avoid hot-reload connection leaks).
- Never block UI on a swipe write — optimistic update + Server Action.
- One swipe decision per (user, model); enforced by DB unique constraint.

## Running locally
1. `npm install`
2. Create a Supabase project and copy `.env.example` → `.env`, filling in `DATABASE_URL`,
   `DIRECT_URL`, `AUTH_SECRET` (full walkthrough in `SUPABASE.md`).
3. `npx prisma migrate deploy` — apply the migrations to your Postgres DB
4. `npm run db:seed` — load the LLM catalog (9 models, 16 features)
5. `npm run dev` → http://localhost:3000 — sign in with any email

## Commands
- `npm run dev` / `npm run build` / `npm start` — Next.js
- `npm run db:migrate` — `prisma migrate dev` (apply schema changes)
- `npm run db:seed` — reseed the catalog (idempotent upserts)
- `npm run db:studio` — inspect the DB
- `npm run db:dbml` — `prisma generate`: Prisma Client **and** the DBML diagram (`prisma/dbml/schema.dbml`)
- `/schema` (Claude Code) — open the schema as an interactive ER diagram in the browser

## Schema diagram (DBML)
View the schema as a dbdiagram.io-style interactive diagram. The `schema-viewer` tooling
is installed **globally** (`~/.claude/mcp-servers/schema-viewer`) and exposed as the
`/schema` command — run `/schema` (curated file) or `/schema prisma/dbml/schema.dbml`
(generated). Both now render enum boxes for `SwipeDirection` / `FeatureCategory`.

Two DBML files exist on purpose:
- **`schema.dbml`** (root) — hand-curated design reference; what `/schema` shows by default.
- **`prisma/dbml/schema.dbml`** — **generated** from `prisma/schema.prisma` by
  `prisma-dbml-generator` on every `prisma generate`.

## Supabase Migration
The codebase is migrated to Postgres (provider `postgresql`, real enums, pooled +
direct URLs, Postgres init migration in `prisma/migrations/`). To stand up a database,
follow **`SUPABASE.md`** (create project → fill `.env` → `prisma migrate deploy` → seed).
RLS is deferred; every query is already scoped to the session user via Prisma.

## Roadmap
1. ✅ Scaffold Next.js + Prisma + Auth.js; schema + seed.
2. ✅ Swipe deck UI + record swipes.
3. ✅ Matches list (with unmatch).
4. ✅ Phase 2: user preferences + per-card preference highlighting.
5. 🔄 Migrate to Supabase — code migrated to Postgres; run `SUPABASE.md` to deploy a DB.
