# CLAUDE.md — Eddie & Yasmine's Wedding Website

## Project Overview

This is a full-featured wedding website for Eddie & Yasmine built with a Vite + React + TypeScript stack and Supabase as the backend. It includes public guest-facing pages, password-locked interactive features, an admin dashboard, and a visual content editor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite 5 (dev server on port 8080) |
| Framework | React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + `class-variance-authority` + `tailwind-merge` |
| UI components | shadcn-ui (Radix UI primitives) |
| Routing | React Router DOM v6 |
| Data fetching | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| XSS protection | DOMPurify |
| Fonts | Cormorant Garamond, Montserrat, Playfair Display |

---

## Development Commands

```bash
npm i              # Install dependencies
npm run dev        # Start dev server (http://localhost:8080, hot reload)
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

No test runner is configured. Do not add tests unless explicitly asked. Linting is available via `npm run lint`.

---

## Environment Variables

Variables live in a `.env` file at the project root (never committed to git).

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

- All `VITE_*` variables are bundled into the client — never put `service_role` key here.
- The active Supabase project ID is `hxvydccjwfnbyrzwybsz`.
- Access in code with `import.meta.env.VITE_*`.

---

## Directory Structure

```
src/
├── App.tsx                         # Route definitions (all routes here)
├── main.tsx                        # App entry point, wraps with providers
├── index.css                       # Global CSS / Tailwind imports
├── vite-env.d.ts
│
├── pages/                          # Top-level route pages
│   ├── Home.tsx
│   ├── OurStory.tsx
│   ├── WeddingParty.tsx
│   ├── EventDetails.tsx
│   ├── Travel.tsx
│   ├── FAQ.tsx
│   ├── Registry.tsx
│   ├── RSVP.tsx
│   ├── InviteRSVP.tsx              # Invite-code RSVP (/invite/:code)
│   ├── NotFound.tsx
│   ├── admin/                      # Admin pages (protected)
│   │   ├── AdminLogin.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminContent.tsx
│   │   ├── AdminVisualEditor.tsx
│   │   ├── AdminGuestbook.tsx
│   │   ├── AdminPhotos.tsx
│   │   ├── AdminRSVPs.tsx
│   │   ├── AdminSongRequests.tsx
│   │   ├── AdminInvites.tsx
│   │   └── AdminLockedPages.tsx
│   └── locked/                     # Guest-locked interactive pages
│       ├── InteractiveTimeline.tsx
│       ├── GuestQuiz.tsx
│       ├── MessageWall.tsx
│       ├── PhotoUpload.tsx
│       ├── LiveUpdates.tsx
│       ├── Gallery.tsx
│       └── SecretPage.tsx
│
├── components/
│   ├── ui/                         # shadcn-ui primitives (DO NOT modify structure)
│   ├── features/                   # Feature-specific components
│   │   ├── admin/                  # Admin UI (editors, panels, pickers)
│   │   ├── events/                 # Event schedule components
│   │   ├── guestbook/              # Guestbook form and list
│   │   ├── photos/                 # Photo gallery and upload
│   │   ├── rsvp/                   # RSVP form, fields, confirmation
│   │   └── songs/                  # Song request components
│   ├── layout/                     # Layout, Navigation, Footer
│   ├── shared/                     # Reusable cross-feature components
│   ├── animation/                  # FadeIn, PageTransition, StaggerContainer
│   └── providers/                  # AppProviders, ReactQueryProvider
│
├── contexts/
│   └── AdminAuthContext.tsx         # Admin session state (login/logout)
│
├── hooks/                          # Custom React hooks
│   ├── useContent.ts               # CRUD for content table (React Query)
│   ├── useRsvps.ts
│   ├── useAdminAuth.ts
│   ├── useAdminStats.ts
│   ├── useAdminPreview.ts
│   ├── usePageDrafts.ts
│   └── use-mobile.tsx
│
├── lib/
│   ├── utils.ts                    # cn() helper (clsx + tailwind-merge)
│   ├── sanitize.ts                 # DOMPurify wrappers (sanitizeHtml, sanitizeText)
│   ├── validation.ts               # Shared Zod schemas (email, name, message, etc.)
│   ├── wedding-utils.ts
│   ├── supabase/
│   │   ├── client.ts               # Supabase browser client
│   │   ├── server.ts
│   │   └── index.ts
│   └── admin/
│       ├── sectionConfig.ts        # Visual editor page/section/field config
│       ├── repeatableItems.ts      # Schema for repeating content arrays
│       ├── imageUtils.ts           # Image editing pipeline utilities
│       ├── iframeOverlayScript.ts  # Injected script for visual editor overlay
│       └── stats.ts
│
└── integrations/
    └── supabase/
        ├── client.ts               # Auto-generated Supabase client (VITE_SUPABASE_PUBLISHABLE_KEY)
        └── types.ts                # Auto-generated DB type definitions

supabase/
├── config.toml
└── migrations/                     # SQL migration files (ordered by timestamp)

docs/
├── SECURITY.md                     # Security measures and testing guide
└── ENV_VARIABLES.md                # Credential management guide

scripts/
└── insert_test_rsvp.mjs            # Test utility: insert a sample RSVP

.github/
└── copilot-instructions.md         # Legacy AI agent instructions
```

---

## Application Routes

### Public Pages
| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page with hero, countdown |
| `/our-story` | `OurStory` | Couple's story |
| `/wedding-party` | `WeddingParty` | Bridesmaids & groomsmen |
| `/event-details` | `EventDetails` | Schedule and venue |
| `/travel` | `Travel` | Hotels and travel tips |
| `/faq` | `FAQ` | Frequently asked questions |
| `/registry` | `Registry` | Gift registry links |
| `/rsvp` | `RSVP` | RSVP form |
| `/invite/:code` | `InviteRSVP` | Personalized invite RSVP |

### Locked Pages (Guest Access)
Require a guest password/code to access.

| Path | Component |
|---|---|
| `/timeline` | `InteractiveTimeline` |
| `/quiz` | `GuestQuiz` |
| `/guestbook` | `MessageWall` |
| `/photos` | `PhotoUpload` |
| `/updates` | `LiveUpdates` |
| `/gallery` | `Gallery` |
| `/secret` | `SecretPage` |

### Admin Pages
Protected by Supabase Auth (email+password login).

| Path | Component |
|---|---|
| `/admin` or `/admin/login` | `AdminLogin` |
| `/admin/dashboard` | `AdminDashboard` |
| `/admin/content` | `AdminContent` |
| `/admin/visual-editor` | `AdminVisualEditor` |
| `/admin/guestbook` | `AdminGuestbook` |
| `/admin/photos` | `AdminPhotos` |
| `/admin/rsvps` | `AdminRSVPs` |
| `/admin/song-requests` | `AdminSongRequests` |
| `/admin/invites` | `AdminInvites` |
| `/admin/locked-pages` | `AdminLockedPages` |

---

## Database Schema (Supabase)

All types are defined in `src/integrations/supabase/types.ts`.

| Table | Purpose | Key Columns |
|---|---|---|
| `content` | Key-value store for all editable page content | `key`, `value` |
| `events` | Wedding event schedule | `name`, `start_time`, `end_time`, `location`, `description` |
| `guests` | Guest list | `email`, `name`, `invite_code`, `attending`, `dietary_needs`, `plus_ones` |
| `guestbook_messages` | Public guestbook entries | `content`, `approved`, `guest_id` |
| `messages` | Alternative message table | `content`, `approved`, `guest_id` |
| `invite_analytics` | Track invite link opens | `invite_id`, `event_type`, `metadata` |
| `invites` | Invite codes | `code`, `label`, `max_guests`, `used_by`, `venue_name`, `venue_address` |
| `page_drafts` | Draft content versions for visual editor | `page_key`, `content` (JSON), `is_published`, `version` |
| `photos` | Guest-uploaded photos | `file_url`, `caption`, `approved`, `guest_id`, `tags` |
| `rsvps` | RSVP submissions | `name`, `email`, `attending`, `guests`, `meal_preference`, `message`, `invite_code` |
| `song_requests` | Music requests | `title`, `artist`, `guest_id` |

### Schema Changes
When modifying the database schema:
1. Create a new SQL migration file in `supabase/migrations/` with timestamp prefix
2. Run migrations via `npx supabase db push` or manually via the Supabase SQL Editor
3. Regenerate types if needed (or update `src/integrations/supabase/types.ts` manually)

---

## Key Conventions

### Import Alias
Always use `@/` to reference `src/`. This is configured in `tsconfig.json` and `vite.config.ts`.

```ts
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/lib/sanitize';
```

### Styling
- Use Tailwind utility classes
- For component variants, use `class-variance-authority` (`cva`)
- Merge classes with `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`)
- Follow patterns in `src/components/ui/` for shadcn component style

### Data Fetching
- Use TanStack React Query (`useQuery`, `useMutation`) for all Supabase calls
- Query clients are initialized in `src/App.tsx` (`QueryClientProvider`)
- Cache content for 5 minutes (`staleTime: 5 * 60 * 1000`)
- Invalidate related queries on mutation success

### Forms
- Use `react-hook-form` with `@hookform/resolvers/zod`
- Shared Zod schemas live in `src/lib/validation.ts` — reuse them

### Security (Required)
- **Always** sanitize user-generated content before rendering:
  - HTML content: use `sanitizeHtml()` from `@/lib/sanitize`
  - Plain text/names: use `sanitizeText()` from `@/lib/sanitize`
- Use Zod validation schemas from `@/lib/validation` for all form fields
- Never put secrets in `VITE_*` environment variables (they are public)
- Do not bypass RLS policies; all table access must go through the anon client

### Admin Authentication
- Admin session managed by `AdminAuthContext` in `src/contexts/AdminAuthContext.tsx`
- Uses Supabase Auth (`signInWithPassword`)
- Admin login has exponential backoff lockout after 3 failed attempts (30s → 15m)
- Protect admin routes with `ProtectedRoute` component

### Content Management
- Page content is stored as key-value pairs in the `content` table
- Keys follow a naming pattern: `<page>_<field>` (e.g., `home_announcement`, `story_quote`)
- The visual editor (`/admin/visual-editor`) lets admins edit content via an iframe overlay
- Section/field config for the visual editor lives in `src/lib/admin/sectionConfig.ts`
- Repeating content (bridesmaids, FAQ items, etc.) is configured in `src/lib/admin/repeatableItems.ts`

---

## Common Tasks

### Add a New Route/Page
1. Create `src/pages/MyPage.tsx`
2. Add `<Route path="/my-path" element={<MyPage />} />` in `src/App.tsx`

### Add a Feature Component
- Place under `src/components/features/<feature>/`
- Export from the feature's `index.ts` barrel file

### Add a Custom Hook
- Place in `src/hooks/`
- Use React Query for any Supabase data fetching

### Add a Repeatable Content Section to the Visual Editor
1. Define the item schema in `src/lib/admin/repeatableItems.ts`
2. Reference it via `repeatableKey` in the section config in `src/lib/admin/sectionConfig.ts`
3. Add image field keys to `getRepeatableImageFields()` if applicable

### Add a Database Migration
1. Create `supabase/migrations/<timestamp>_<description>.sql`
2. Apply via `npx supabase db push` or Supabase Dashboard → SQL Editor

---

## Security Summary

| Measure | Location | Status |
|---|---|---|
| Row-Level Security (RLS) | `supabase/migrations/20260215000000_add_rls_policies.sql` | Requires migration |
| Rate limiting (DB-level) | `supabase/migrations/20260215000001_add_rate_limiting.sql` | Requires migration |
| XSS sanitization (DOMPurify) | `src/lib/sanitize.ts` | Implemented |
| Admin login lockout | `src/pages/admin/AdminLogin.tsx` | Implemented |
| Input validation (Zod) | `src/lib/validation.ts` | Implemented |
| `.env` excluded from git | `.gitignore` | Configured |

Rate limits enforced: 5 RSVPs/hour per email, 3 guestbook messages/hour per name, 10 photo uploads/hour, 5 song requests/hour per email.

---

## Notes for AI Agents

- **Before patching**, state exactly which file(s) you will change.
- **Preserve** the `@/` import alias and existing file organization.
- **Prefer minimal, focused edits** — do not refactor unrelated code.
- **No test runner** — do not add test files unless asked.
- **TypeScript-safe** — all changes must compile without errors.
- **When changing data models**, include a SQL migration file and note the required Supabase steps.
- **Two Supabase client locations exist**: `src/lib/supabase/client.ts` (uses `VITE_SUPABASE_PUBLISHABLE_KEY`) and `src/integrations/supabase/client.ts` (same key, auto-generated). Prefer importing from `@/integrations/supabase/client` for consistency.
- **Content keys** for the `content` table follow the pattern `<page>_<field>`. Check `src/lib/admin/sectionConfig.ts` for all defined keys before adding new ones.
- **Admin auth** uses `src/contexts/AdminAuthContext.tsx` — do not create a parallel auth system.
- The project was scaffolded via **Lovable** (lovable.dev) — `lovable-tagger` runs in dev mode to tag components.
