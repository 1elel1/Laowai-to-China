# TravelingMate

A marketplace that matches people travelling to China with locals who can show them
around — licensed professional guides and unpaid "local friends" alike — before the
traveller's flight leaves.

The site is bilingual: travellers browse in English, guides manage their listing in
Chinese, and the whole UI switches on one cookie.

---

## What is in here

| Area | Route | Who |
| --- | --- | --- |
| Landing page, city and theme entry points | `/` | everyone |
| Search with city / language / theme / price / rating filters | `/guides` | everyone |
| Guide profile, photos, reviews, booking form | `/guides/[id]` | everyone |
| Sign up / log in | `/signup`, `/login` | everyone |
| Booking requests you sent, reviews after a trip | `/dashboard` | travellers |
| Guide application and profile editor | `/become-a-guide` | guides |
| Incoming requests, accept / decline | `/guide/dashboard` | guides |
| Threaded messaging with unread counts | `/messages`, `/messages/[id]` | both sides |
| Application review queue, approve / reject / suspend | `/admin` | admins |

**Not included, on purpose:** payments. The platform introduces people and hands over
contact details once a booking is accepted; money is settled between the traveller and
the guide directly. That keeps you out of payment licensing and escrow obligations while
you validate the idea. See [Before you launch](#before-you-launch).

## Stack

- **Next.js 15** (App Router, React 19, Server Components + Server Actions)
- **TypeScript** everywhere, `strict` on
- **Tailwind CSS v4** with CSS-variable theming (light and dark)
- **Prisma 6** over SQLite locally, PostgreSQL in production
- **jose** + **bcryptjs** for sessions — a signed JWT in an httpOnly cookie, no auth SaaS
- **zod** for input validation, shared by every form

No component library and no CSS framework beyond Tailwind, so there is nothing to fight
when you restyle it.

---

## Running it locally

```bash
npm install
```

If npm blocks install scripts (npm 11+), approve the ones Prisma and esbuild need:

```bash
npm approve-scripts @prisma/engines @prisma/client prisma esbuild sharp
```

Copy the environment file and set a real secret:

```bash
cp .env.example .env
```

Then edit `.env` — at minimum replace `AUTH_SECRET`. Generate one with:

```bash
openssl rand -base64 32
```

Create the database and load demo data:

```bash
npm run setup
```

```bash
npm run dev
```

Open http://localhost:3000.

### Demo accounts

The seed creates one admin, three travellers and fifteen guides.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@travelingmate.test` | `admin12345` |
| Traveller | `sofia@example.com` | `password123` |
| Traveller | `daniel@example.com` | `password123` |
| Traveller | `mika@example.com` | `password123` |
| Guide (professional, Beijing) | `liwei@example.com` | `password123` |
| Guide (local friend, Chengdu) | `zhangmei@example.com` | `password123` |
| Guide (pending review) | `guoqian@example.com` | `password123` |

Every other seeded guide uses `password123` too — see `prisma/seed.ts` for the list.

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Sync the schema to the database without a migration |
| `npm run db:migrate` | Create a migration (use this once you have real data) |
| `npm run db:seed` | Load demo data |
| `npm run db:reset` | Wipe and reseed |
| `npm run db:studio` | Prisma Studio |
| `npm run db:use <sqlite\|postgresql>` | Switch the datasource provider |

---

## Deploying

The app is written to be portable: nothing depends on a specific cloud. Pick one.

### The one decision that matters first

Your two user groups sit on opposite sides of the Great Firewall. Travellers browse from
abroad before their trip; guides are inside mainland China, using the site every day.

- **Vercel and most Western PaaS are slow or unreachable from mainland China.** Fine for
  a first prototype aimed at travellers, painful for your guides.
- **Alibaba Cloud / Tencent Cloud are fast domestically but require an ICP filing
  (备案) before a domain can serve traffic from a mainland region.** Budget two to four
  weeks and a mainland business entity for that.
- **Hong Kong or Singapore regions of Alibaba/Tencent need no ICP filing** and are a
  reasonable middle ground: acceptable latency both directions, no filing paperwork.
  This is usually the right first move.

### Option A — Vercel (fastest to a working URL)

1. Push the repo to GitHub and import it at vercel.com.
2. Create a Postgres database (Vercel Postgres, [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) all work).
3. Switch the Prisma provider and commit the change:
   ```bash
   npm run db:use postgresql
   ```
4. Set the environment variables in the Vercel dashboard:
   `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
5. Push the schema once from your machine, pointed at the production database:
   ```bash
   DATABASE_URL="postgresql://…" npx prisma db push
   ```

### Option B — Docker (Alibaba Cloud, Tencent Cloud, Fly.io, Railway, a plain VPS)

```bash
npm run db:use postgresql
docker compose up --build
```

That brings up Postgres and the app together on port 3000. First run only:

```bash
docker compose exec app npx prisma db push
```

For a real deployment, build and push the image to your registry (Alibaba ACR, Tencent
TCR, GHCR), then run it with `DATABASE_URL` and `AUTH_SECRET` injected as secrets and a
managed Postgres (阿里云 RDS / TencentDB) behind it. Put your load balancer or Nginx in
front for TLS.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` locally, a Postgres URL in production |
| `AUTH_SECRET` | yes | ≥32 random characters. Rotating it logs everyone out |
| `NEXT_PUBLIC_APP_URL` | yes | Public origin, no trailing slash |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | seed only | The admin account the seed creates |

---

## How the code is laid out

```
prisma/
  schema.prisma      Portable schema — no enums, no arrays, no Json (SQLite compatible)
  seed.ts            Demo data
scripts/
  set-db-provider.mjs  Rewrites the datasource provider (npm run db:use)
src/
  actions/           Server Actions — every mutation lives here
  app/               Routes (App Router)
  components/        UI, split by feature
  lib/
    constants.ts     The string "enums" and reference data (cities, languages, themes)
    validation.ts    zod schemas shared by forms and actions
    session.ts       JWT cookie helpers — Edge-safe, imported by middleware
    auth.ts          getCurrentUser / requireUser / requireRole (Node only)
    i18n.ts          Dictionaries — client-safe
    i18n-server.ts   getLocale / getT — reads cookies, server only
    guides.ts        Search query building
  middleware.ts      Cheap auth gate on /dashboard, /messages, /guide, /admin
```

A few conventions worth knowing before you extend it:

- **The schema avoids every SQLite-incompatible Prisma feature** so `npm run db:use` is a
  one-line switch. Statuses are `String` columns constrained in `src/lib/constants.ts`;
  lists (languages, themes, photos) are join tables.
- **Money is stored in minor units** (`Int` cents / 分). No floats in the database.
- **Mutations are Server Actions, not API routes.** If you later add a mobile client,
  add `app/api/**` route handlers alongside — the logic in `src/lib` is already reusable.
- **Dictionary shape is enforced by the type system.** `zh` is typed as `typeof en`, so a
  missing Chinese string fails `npm run typecheck` instead of rendering blank.

---

## Before you launch

These are deliberate gaps in the MVP, not oversights. Work through them before taking
real bookings.

**Legal and compliance**

- **ICP filing (备案)** if you host on a mainland region with your own domain.
- **Real Terms of Service and Privacy Policy.** The footer links are placeholders. China's
  PIPL applies to the personal data you are collecting from guides.
- **Decide what you are.** Right now the platform explicitly does not take payment and is
  not a travel agency — the disclaimer on the home page says so. The moment you handle
  money, travel agency licensing (旅行社业务经营许可证) becomes a live question. Get
  advice before that step.
- **Guide licence verification.** Licence numbers are typed in by the guide and shown as
  entered. Nothing checks them. Verify them manually in the admin queue, and consider
  requiring a photo of the licence.

**Product**

- **No email.** Signup, booking notifications, and password reset all need a transactional
  provider (Alibaba DirectMail, Tencent SES, Resend). There is no password reset flow at all.
- **No image uploads.** Guides paste photo URLs. Wire up OSS / COS / S3 with presigned
  uploads and switch `GuidePhoto.url` to your bucket.
- **No rate limiting** on signup, login, or messaging.
- **Editing an approved profile does not re-trigger review.** Deliberate, so guides can fix
  typos — but it means an approved guide can rewrite their whole listing. Add a diff check
  or a re-review trigger if that worries you.
- **Messaging is request/response, not realtime.** Add polling or a websocket if the
  conversation volume justifies it.
- **Search is a `LIKE` scan.** Fine to a few thousand guides. Move to Postgres full-text
  search or Meilisearch after that.
