# KKARINZZZ — Cybersecurity Research Lab & Portfolio

A production-grade, full-stack cybersecurity portfolio: bright, editorial, and heavily interactive. Built as a digital research lab rather than a template.

## Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Three.js (React Three Fiber + Drei) |
| Backend    | **Vercel/Prod:** Supabase (Postgres + Auth + RLS, no Express server). **Docker/self-hosted:** Node.js 22 · Express · TypeScript · Zod |
| Database   | Supabase Postgres (prod) · PostgreSQL 16 + Prisma (Docker alt) |
| Auth       | Supabase Auth email/password + `app_metadata.role = "admin"` (prod) · JWT httpOnly cookie (Docker alt) |
| Infra      | Vercel (frontend) + Supabase (backend) — atau Docker Compose + Nginx |

Ada **dua varian frontend** di repo ini:
- `frontend/` — versi **Docker + Express** (backend dengan JWT cookie, nginx).
- `frontend-v2/` — versi **Vercel + Supabase** (data layer `@/lib/api` memakai supabase-js, akses dijaga RLS) — ini yang dipakai prod.

## Quick Start (Docker)

```bash
# 1. Configure environment
cp .env.example .env

# 2. Build & run everything (frontend :3000, backend :4000, postgres :5432)
docker compose up --build

# 3. Open the site
#    Public:    http://localhost:3000
#    Admin:     http://localhost:3000/admin
```

Migrations and seed data run automatically on first backend start.

### Local development (no Docker)

```bash
# Terminal 1 — database
docker compose up postgres

# Terminal 2 — backend (http://localhost:4000)
cd backend
cp ../.env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# Terminal 3 — frontend (http://localhost:5173, proxies /api → :4000)
cd frontend
npm install
npm run dev
```

## Admin

| Item      | Value                    |
| --------- | ------------------------ |
| URL       | `http://localhost:3000/admin` |
| Username  | `admin` (set via `ADMIN_USERNAME`) |
| Password  | Set via `ADMIN_PASSWORD` in `.env` (required, ≥8 chars) |

> Admin credentials are injected from `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars. The backend fails to start the seed if they are missing or weak. Passwords are bcrypt-hashed, never stored in plaintext.

From the admin panel you can manage everything shown on the public site: projects, writeups (Markdown), skills, certificates, achievements, social links, and site settings (hero/about/contact copy).

## Architecture

```
web/
├── frontend/              # React SPA (Vite) — varian Docker/Express
├── frontend-v2/           # React SPA (Vite) — varian Vercel + Supabase (prod)
│   ├── src/
│   │   ├── components/    # layout/, three/, ui/, admin/
│   │   ├── pages/         # public/ + admin/ (sama dgn frontend/ + /certificates)
│   │   ├── lib/api.ts     # Data layer supabase-js (semua akses via RLS)
│   │   ├── lib/supabase.ts# Client supabase-js (VITE_SUPABASE_URL/ANON_KEY)
│   │   ├── types/ hooks/ styles/
├── backend/               # Express API (opsional — hanya utk varian Docker)
│   ├── prisma/
│   │   ├── schema.prisma  # Semua entity (baris *: referensi schema.sql)
│   │   └── seed.ts        # Admin user + konten demo (Docker flow)
│   └── src/               # routes/, middleware/, utils/, index.ts
├── database/
│   ├── schema.sql         # Tabel + index — import ke Supabase SQL Editor
│   ├── rls.sql            # RLS policies: anon baca publik, admin full CRUD
│   └── seed-data.sql      # Konten demo idempoten (setelah schema + rls)
├── docker-compose.yml
├── .env.example
└── README.md
```

## API

All endpoints under `/api`. Mutations (`POST/PUT/DELETE`) require the admin session cookie. Public `GET`s are open.

```
GET    /health
POST   /auth/login   PUT /auth/logout   GET /auth/me

GET    /projects                     # ?published&featured&category&search
GET    /projects/:slug
POST   /projects    PUT /projects/:id    DELETE /projects/:id

GET    /writeups                     # ?published&category&search
GET    /writeups/:slug
POST   /writeups    PUT /writeups/:id    DELETE /writeups/:id

GET    /skills      POST /skills     PUT /skills/:id   DELETE /skills/:id
GET    /experience  POST /experience PUT /experience/:id DELETE /experience/:id
GET    /achievements POST /achievements PUT /achievements/:id DELETE /achievements/:id
GET    /education   POST /education  PUT /education/:id DELETE /education/:id
GET    /social-links POST /social-links PUT /social-links/:id DELETE /social-links/:id
GET    /site-settings  GET /site-settings/:key  PUT /site-settings/:key

GET    /admin/dashboard/stats        # counts + recent activity
GET    /activity                     # recent admin actions
```

## Public Routes

```
/                  Home (3D workstation hero, featured work, stats, latest writeups)
/about             Editorial biography
/projects          Project index with search + category filter
/projects/:slug    Project case study (Markdown)
/writeups          Research index
/writeups/:slug    Technical publication (ToC, code highlighting, related)
/certificates      Certification showcase
/contact           Contact & social links
/admin             Admin login (also /admin/login)
/admin/dashboard   Stats + recent activity
/admin/projects …  Full CRUD for every entity
```

## Features

- **Interactive 3D workstation** — procedural R3F scene (monitor with animated security UI, PC case, keyboard, cables, particles). Mouse parallax, click the case for a system-status panel, hover highlight. Simplified & static on mobile / reduced-motion.
- **Command palette** — `Ctrl+K` / `Cmd+K` navigation, keyboard-driven, accessible dialog.
- **Design language** — bright paper-and-ink editorial: hard offset shadows, 2px ink borders, electric blue / orange / yellow accents, mono technical annotations. No glassmorphism, no dark-mode-everything.
- **Custom cursor, magnetic buttons, animated counters, scroll reveals** — restrained, purposeful motion (respects `prefers-reduced-motion`).
- **Markdown everywhere** — projects and writeups are rich Markdown, rendered with syntax highlighting and article typography.
- **Easter eggs** — system-status overlay, hidden diagnostics line in the command palette, keyboard shortcuts.
- **SEO** — meta/OG tags, semantic HTML, SPA-friendly nginx config.
- **Security** — httpOnly auth cookie, bcrypt hashing, Zod input validation, Helmet headers, parameterized Prisma queries, sanitized Markdown (DOMPurify), no secrets committed, non-root container user.

## Database Schema

`User` · `Project` · `Writeup` · `Skill` · `Certificate` · `Achievement` · `SocialLink` · `SiteSetting` · `ActivityLog` · `Message`

See `backend/prisma/schema.prisma`. Reproduce from scratch (Docker/self-hosted Postgres):

```bash
cd backend && npx prisma migrate deploy && npm run seed
```

## Deploy: Vercel + Supabase (produksi)

Arsitektur prod **tanpa Express server** — frontend memanggil Supabase langsung via supabase-js; semua akses dijaga **RLS** (anon hanya baca data publik; admin dapat CRUD penuh).

### 1. Buat project Supabase

- Buka [supabase.com](https://supabase.com) → New project.
- Catat dari **Settings → API**: `Project URL` dan `anon public key`.

### 2. Import SQL (berurutan, via SQL Editor)

1. **`database/schema.sql`** — tabel + index (`gen_random_uuid()` default, unique keys utk seed idempoten).
2. **`database/rls.sql`** — fungsi `is_admin()` (baca `auth.jwt()` → `app_metadata.role = 'admin'`), grants, dan semua RLS policies. `User` dikunci (dikelola Supabase Auth, bukan tabel).
3. **`database/seed-data.sql`** — konten demo idempoten (14 site settings, 6 projects, 3 writeups, 20 skills, 3 certificates, 3 achievements, 5 social links). Bisa di-`Run` ulang tanpa duplikasi.

### 3. Buat admin di Supabase Auth

Admin **bukan** seed dari SQL — dibuat lewat dashboard:

1. **Authentication → Users → Add user** → set email + password.
2. Setelah user muncul, klik user → **App metadata** → `{"role": "admin"}` → Save.

`is_admin()` di RLS membaca claim ini dari JWT, jadi role langsung aktif tanpa login ulang.

> Cara alternatif via SQL: `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '...';`

### 4. Konfigurasi frontend-v2

```bash
cd frontend-v2
cp .env.example .env.local   # isi VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
bun install && bun run build # verifikasi lokal (tsc + vite)
```

### 5. Deploy ke Vercel

- Import repo, framework **Vite**, build command `bun run build`, output dir `dist`.
- Isi env vars **di Vercel** (build-time): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Public routes otomatis SPA-friendly (Vercel serve `dist`). `/admin` login via Supabase Auth email.

> Supabase (PostgreSQL-as-a-Service) — varian lama (Express + Prisma): section di bawah.

## Supabase (PostgreSQL-as-a-Service) — varian Express/Prisma (legacy)

Backend Docker dapat juga memakai Supabase Postgres tanpa Docker Postgres:

1. **Import schema** — Supabase Dashboard → SQL Editor → paste `database/schema.sql` → Run. Relasi dikelola Prisma di aplikasi, bukan foreign key DB.
2. **Connection string** — Settings → Database → **Session pooler** (port `5432`): isi `backend/.env` sebagai `DATABASE_URL` (hapus baris Postgres lokal).
   ```
   postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres
   ```
3. **Seed** — `cd backend && npm install && npm run generate && npm run seed` (wajib `ADMIN_PASSWORD` ≥8 chars).
4. **Run backend** — `cd backend && npm run build && npm start`.

> Jangan jalankan `prisma migrate deploy` terhadap Supabase setelah import `schema.sql` — tabel sudah eksis. Untuk perubahan schema: edit `schema.prisma` lalu `npx prisma db push`.

## Production Notes

- Change `JWT_SECRET` and `ADMIN_PASSWORD` in `.env` (or env vars) — the defaults are dev-only.
- `PUBLIC_API_URL` in `.env` controls what the browser calls; in Docker both are on localhost by default.
- The 3D scene is chunk-split (manualChunks) so the hero doesn't bloat other routes.
- All demo achievements are flagged `isPlaceholder` in the DB and fully editable.

## License

Private / personal project.