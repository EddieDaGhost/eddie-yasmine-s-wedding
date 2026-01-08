## Copilot / AI agent instructions for this repo

Quick summary
- **Stack**: Vite + React + TypeScript + Tailwind + shadcn-ui
- **Dev server**: `npm i` then `npm run dev` (Vite)
- **Build**: `npm run build` / `npm run build:dev` / `npm run preview`

Project structure & big picture
- Client-only React app. Entry: [src/main.tsx](src/main.tsx#L1) wraps the app with providers.
- Routing and page boundaries live in [src/App.tsx](src/App.tsx#L1) — modify routes here.
- UI primitives & design system: components under [src/components/ui](src/components/ui#L1) (shadcn patterns).
- Feature areas: `src/pages/*` (app pages) and `src/components/features/*` (feature-specific components).
- Global providers and data layer: `AppProviders` and React Query usage. See [src/App.tsx](src/App.tsx#L1) and [src/components/providers](src/components/providers/AppProviders.tsx#L1).

Data, backend and integrations
- Supabase is the primary backend: check [src/lib/supabase.ts](src/lib/supabase.ts#L1) and `src/integrations/supabase` for usage.
- Database migrations live in `supabase/migrations` — schema changes should include SQL migration files.
- Client-side caching is handled with React Query (`@tanstack/react-query`) — provider initialized in `App.tsx`.

Conventions & patterns to follow
- Path alias: imports use `@/` to reference `src` (configured in `tsconfig.json`). Preserve this alias.
- UI: prefer reusable components in `src/components/ui` and follow existing prop & variant patterns (class-variance-authority + tailwind-merge).
- Feature grouping: new features go under `src/components/features/<feature>` and pages under `src/pages`.
- Hooks: put cross-page hooks in `src/hooks` (e.g., `useRsvps`, `useContent`).
- Admin functionality: admin pages under `src/pages/admin` and context in `src/contexts/AdminAuthContext.tsx`.

Developer workflows & commands
- Install deps: `npm i`
- Start dev server: `npm run dev` (Vite, hot reload)
- Build for prod: `npm run build` (or `npm run build:dev` for development build)
- Preview production build: `npm run preview`
- Lint: `npm run lint` (ESLint configured)

Editing guidance for common tasks
- Add a new route/page: create `src/pages/MyPage.tsx` and add a `<Route path="/my" element={<MyPage/>} />` in [src/App.tsx](src/App.tsx#L1).
- Add a new API-backed feature: add integration helpers in `src/lib` or `src/integrations/supabase`, update migrations if schema changes, and use React Query hooks for data fetching.
- Update shared UI: add or extend component in `src/components/ui` and reuse across pages.

Important files to check first
- App entry & routes: [src/App.tsx](src/App.tsx#L1)
- Providers: [src/components/providers/AppProviders.tsx](src/components/providers/AppProviders.tsx#L1)
- Supabase client: [src/lib/supabase.ts](src/lib/supabase.ts#L1)
- Hooks: `src/hooks/*`
- Pages: `src/pages/*` and `src/pages/admin/*`
- Migrations: `supabase/migrations/*`

Notes for AI agents
- Be explicit about which file(s) you will change before patching — reference the exact path(s).
- Preserve existing import alias (`@/`) and file organization; prefer minimal, focused edits.
- When changing data models, include migration SQL and mention required Supabase steps.
- No test runner present; do not add tests unless asked. Linting available via `npm run lint`.
- Keep changes TypeScript-safe and follow existing styling (Tailwind + class-variance-authority).

If anything above is unclear or you want additional examples (e.g., common component patterns or React Query usage snippets), ask and I'll expand these sections.
