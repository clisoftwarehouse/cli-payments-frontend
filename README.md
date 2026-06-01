# CLI Payments — Admin

Internal admin dashboard for CLI Payments. React 19 + Vite + TypeScript + MUI 7 + TanStack Query.

> See [../PLAN.md](../PLAN.md) and [../ROADMAP.md](../ROADMAP.md) for the architectural plan.
> See [CONTEXT_FRONTEND.md](./CONTEXT_FRONTEND.md) for FSD conventions.

## Quick start

```bash
cp .env.template .env
# Edit .env — set VITE_API_URL to backend URL (default: http://localhost:3000)

npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies `/api/*` to `VITE_API_URL`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TS type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Architecture

This project follows **Feature-Sliced Design**. The relevant layers:

```
src/
├── app/              # Bootstrap, providers, router config
├── pages/            # Route-level shells (layouts: dashboard-layout, auth-layout)
├── widgets/          # Composed UI blocks (sidebar, topbar)
├── features/         # Vertical features (auth, applications, customers, fx, payments, ...)
│   └── <name>/
│       ├── api/      # axios calls + React Query hooks
│       ├── model/    # Zustand stores, business types
│       └── ui/       # pages + components
├── entities/         # Domain models shared across features
├── shared/           # api client, hooks, utils, lib
└── ui-kit/           # Theme + base components
```

### Conventions

- File names: `kebab-case.tsx`. Types: `PascalCase`. Constants: `SCREAMING_SNAKE_CASE`.
- Imports use `@/` alias (never `../../` past 2 levels).
- Forms use `react-hook-form` + `zod` (`@hookform/resolvers/zod`).
- Server state: TanStack Query. Global UI state: Zustand. Local state: `useState`.
- Charts: `recharts`. Excel export: `exceljs`. Toasts: `notistack`.
- No raw `axios` in components — always wrap in a React Query hook.

### Path alias

`@/*` → `./src/*` (configured in `vite.config.ts` + `tsconfig.app.json`).

## Auth flow

1. User logs in via `POST /auth/email/login` → backend returns `{ token, refreshToken, user }`.
2. Tokens are stored in `localStorage` and the Zustand `useAuthStore`.
3. The axios interceptor in `src/shared/api/axios-client.ts` injects `Authorization: Bearer <token>` automatically.
4. Protected routes use `<ProtectedRoute>` from `src/shared/lib/protected-route.tsx`.
5. On 401, the interceptor clears the store and redirects to `/auth/login`.
