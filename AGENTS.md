# Repository Guidelines

## Project Structure & Module Organization
- Root: npm workspaces for `frontend` (Vite + React + TS) and `backend` (Node + TS, Apollo GraphQL).
- `frontend/src`: `features/`, `components/`, `ui/`, `lib/`, `types/`. UI components live in `components/` and `ui/`.
- `backend/src`: `index.ts` (entry), `schema.ts`, `resolvers.ts`, `db.ts`, `auth.ts`, `pokeapi.ts`, `seedPokemon.ts`.
- `docs/`: deployment and GraphQL notes. `deploy.sh` and `apache-config.conf` support server setup.

## Build, Test, and Development Commands
- Dev (both): `npm run dev` — concurrently runs frontend (Vite) and backend (TSX watch).
- Frontend: `npm run dev:frontend`, `npm run build:frontend`, `npm run preview`.
- Backend: `npm run dev:backend`, `npm run build:backend`, `cd backend && npm run start` (run built server), `cd backend && npm run seed` (seed Pokémon data).
- Lint/Format: `npm run lint` (frontend ESLint), `cd frontend && npm run format` or `format:check` (Prettier).

## Coding Style & Naming Conventions
- TypeScript everywhere; 2-space indentation; semicolons optional but be consistent.
- React components: PascalCase (`PokeClicker.tsx`), hooks/vars: camelCase, constants: UPPER_SNAKE_CASE.
- File/dir names: features in `frontend/src/features/<feature>/`; colocate small helpers with usage.
- Import order: external → aliased/internal → relative. Prefer named exports.

## Testing Guidelines
- Frontend: Vitest and Playwright are planned (see README). Until added, prefer component-level checks and Vite preview for manual verification.
- Backend: Use GraphQL Playground against `http://localhost:3001` for queries/mutations. Add unit tests co-located as `*.test.ts` when introducing logic.
- Aim for meaningful coverage on pure utilities; snapshot only for stable UI.

## Commit & Pull Request Guidelines
- Commits: concise imperative subject (≤72 chars), body explains why and scope. Group related changes.
- Example: `feat(clicker): add critical hit multiplier and UI feedback`.
- PRs: clear description, link issues, include screenshots/GIFs for UI, and steps to validate. Note any schema or env changes.

## Security & Configuration
- Copy `backend/.env.example` to `.env`; set `PORT`, `MONGODB_URI`, `MONGODB_DB_NAME`. Do not commit secrets.
- Validate schema changes with both server and client; bump seed script if data shape changes.
