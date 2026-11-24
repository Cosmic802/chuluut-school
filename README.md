# Чулуут сумын ЕБС — school website

Minimal full-stack site: public pages (Home, Gallery, About, News) and a role-based admin panel at `/admin`.
Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + SQLite · bcrypt · Zod.

## Setup

```bash
npm install
npm run dev
```

`npm run dev` runs `prisma db push` and the seed script automatically before starting.
Open http://localhost:3000.

Requires Node.js 18.18+ (20 LTS recommended).

## First run

1. Review `.env`. It contains development defaults:
   - `SESSION_SECRET`: replace with a random string of 32+ characters.
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`: create the first super admin. The seed only runs when no super admin exists.
2. Log in at http://localhost:3000/admin/login.
3. Change the password or create other accounts under **Хэрэглэгчид** (super admin only).

To recreate the first super admin, delete `prisma/dev.db` and run `npm run dev` again.

## Roles

- **Ерөнхий админ (SUPER_ADMIN)**: everything, including creating, disabling, changing roles of, and deleting accounts, and viewing the audit log.
- **Админ (ADMIN)**: photos, captions, school introduction, and news.
- The last active super admin cannot be disabled, demoted, or deleted. Users cannot change their own role or disable themselves.

## Adding photos

Go to **Зураг → Зураг нэмэх**, select up to 30 files (JPG, PNG, WEBP, 10 MB each), and submit.
Each photo then gets its own title and description; use ↑ / ↓ to reorder. Files are validated by MIME type, size, and file signature, then stored in `public/uploads/photos/`.

## Editing content

- **Танилцуулга**: paragraphs separated by a blank line; logo and image upload.
- **Мэдээ**: title, date, body, and publish toggle.

## Audit log

Every create, update, delete, reorder, and account change is recorded with user email, action, entity, entity ID, and timestamp (**Үйл явдлын бүртгэл**, super admin only).

## Production notes

- Set `SESSION_SECRET` to a strong secret and `NODE_ENV=production` (cookies are then `Secure`).
- Uploads are stored on local disk; back up `prisma/dev.db` and `public/uploads/`.
- Use `npm run build && npm start` to run a production build.
- Login has no rate limiting. Add it at the reverse proxy if the site is public.

## Assumptions

- Sessions use an HMAC-signed cookie with a 12-hour expiry; no session table was added, since the spec lists only five models. The user is re-read from the database on each request, so disabled accounts lose access immediately.
- The spec's `SchoolInfo` had no image field, but "text, optional logo, and an image" was requested, so `imagePath` was added.
- `AuditLog` stores the user's email as a snapshot, so entries remain readable after an account is deleted.
- Roles are stored as strings (`SUPER_ADMIN`, `ADMIN`) because SQLite does not support Prisma enums.
- Gallery is empty on first run; only the emblem is seeded.
- The Mongolian About text is a draft and needs review.
- Fonts use the system sans-serif stack so the build does not require internet access.
- Dependencies beyond the spec: `zod` (approved) and `dotenv` (for the seed script).
