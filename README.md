# KSU Job Portal

A multi-role job marketplace built with Astro, Supabase, and Tailwind CSS.  
Owners post job listings; seekers browse and express interest; admins review and approve.

---

## Roles & Capabilities

| Role      | Capabilities                                                    |
| --------- | --------------------------------------------------------------- |
| **Admin** | View all listings, approve/deny jobs, manage platform           |
| **Owner** | Post/edit job listings, view interested seekers                 |
| **Seeker**| Browse jobs, search by tags, express interest, manage profile   |

---

## Tech Stack

| Layer        | Technology                                 |
| ------------ | ------------------------------------------ |
| Framework    | [Astro](https://astro.build) 5             |
| Styling      | [Tailwind CSS](https://tailwindcss.com) 3  |
| Auth & DB    | [Supabase](https://supabase.com)           |
| Deploy       | [Cloudflare Pages](https://pages.cloudflare.com) |

---

## Setup

```bash
# 1. Clone and install
git clone <repo-url> && cd ksu-gp-jp
bun install

# 2. Environment
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Database
# Open src/db/setup.sql and run every statement in your Supabase SQL Editor.

# 4. (Optional) Seed test accounts
bun run seed
```

---

## Database

Run **`src/db/setup.sql`** in your Supabase SQL Editor. It creates:

- Extensions (`pgcrypto`, `uuid-ossp`)
- `JOB_APPROVAL` enum
- Tables: `admins`, `owner`, `seeker`, `job_listings`, `job_interests`
- Row-Level Security policies
- `handle_new_user()` trigger that auto-creates profiles after signup

> Do NOT manually insert into `auth.users` — use `supabase.auth.admin.createUser()`  
> (or sign up via the UI and the trigger handles the rest).

---

## Seed Accounts

| Role      | Email              | Password      |
| --------- | ------------------ | ------------- |
| Admin     | admin@test.com     | password123   |
| Owner     | owner@test.com     | password123   |
| Seeker    | seeker@test.com    | password123   |

Run with `bun run seed` after setting `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

---

## Development

```bash
bun run dev       # Start dev server (localhost:4321)
bun run build     # Production build
bun run preview   # Preview production build
bun run seed      # Seed test accounts
```

---

## Project Structure

```
ksu-gp-jp/
├── public/                   # Static assets (images, favicon)
├── scripts/
│   └── seed.ts               # Database seeder
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css
│   ├── components/
│   │   ├── Header.astro           # Guest header
│   │   ├── Footer.astro           # Site footer
│   │   ├── admin/
│   │   │   └── Header.astro       # Admin nav header
│   │   ├── owner/
│   │   │   └── Header.astro       # Owner nav header
│   │   └── seeker/
│   │       └── Header.astro       # Seeker nav header
│   ├── db/
│   │   └── setup.sql              # Full database schema
│   ├── layouts/
│   │   └── BaseLayout.astro       # Root layout (Inter font, meta)
│   ├── lib/
│   │   └── supabase.ts            # Supabase client helpers
│   └── pages/
│       ├── index.astro            # Landing / sign-in
│       ├── admin/
│       │   └── dashboard/
│       │       └── index.astro
│       ├── api/
│       │   ├── admin/approve/
│       │   ├── auth/
│       │   │   ├── admin/signup/
│       │   │   ├── owner/signup/
│       │   │   ├── seeker/signup/
│       │   │   ├── signin/
│       │   │   └── signout/
│       │   ├── job/
│       │   │   ├── add/
│       │   │   ├── approve/
│       │   │   ├── create/
│       │   │   ├── delete/
│       │   │   ├── interested/
│       │   │   └── update/
│       │   ├── owner/update/
│       │   └── seeker/profile/update/
│       ├── job/
│       │   ├── add/
│       │   ├── approve/[...id]/
│       │   └── edit/[...id]/
│       ├── owner/
│       │   ├── dashboard/
│       │   └── signup/
│       └── seeker/
│           ├── dashboard/
│           ├── profile/
│           │   ├── edit/[...id]/
│           │   └── view/[...id]/
│           └── signup/
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── wrangler.toml
└── .env.example
```

---

## Environment Variables

| Variable                     | Required | Description                        |
| ---------------------------- | -------- | ---------------------------------- |
| `SUPABASE_URL`               | Yes      | Supabase project URL               |
| `SUPABASE_ANON_KEY`          | Yes      | Supabase anonymous (public) key    |
| `SUPABASE_SERVICE_ROLE_KEY`  | Seeding  | Service-role key (for `seed.ts`)   |

---

## Credits

Developed by [Ahmet ALMAZ](https://ahmetalmaz.com) — KSU Graduation Project.
