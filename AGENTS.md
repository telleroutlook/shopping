# Repository Guidelines

## Project Structure & Module Organization
Work primarily inside `jd-shop/`. UI primitives belong in `src/components` (shared UI lives under `components/ui`), route-level screens in `src/pages`, cross-cutting state in `src/contexts`, reusable domain hooks in `src/hooks`, and Supabase helpers plus Stripe glue in `src/lib`. Static assets sit in `public/`. Edge functions, SQL, and policies live in `jd-shop/supabase/functions/`, while black-box regression helpers reside outside the app in `tests/scripts/` with their outputs in `tests/reports/`.

## Build, Test & Development Commands
All commands run from `jd-shop/` using pnpm:
```
pnpm install-deps   # sync workspace deps
pnpm dev            # Vite dev server with hot reload
pnpm build          # type-check + production bundle
pnpm build:prod     # production bundle with BUILD_MODE=prod
pnpm preview        # preview built assets locally
pnpm lint           # eslint with react-hooks + ts rules
```
Use `pnpm clean` before release builds if the cache causes inconsistent output.

## Coding Style & Naming Conventions
Author code in TypeScript with 2-space indentation and functional React components. Components/pages are PascalCase (`HomePage.tsx`), hooks use `useCamelCase`, and shared utilities live in `src/lib/*.ts`. Import modules via the `@/` alias defined in `tsconfig`. Styling is Tailwind-first—prefer semantic tokens such as `text-text-primary` over arbitrary colors. Linting is mandatory; resolve `eslint.config.js` warnings about hook dependencies before opening a PR.

## Testing Guidelines
Scenario scripts under `tests/scripts/` exercise the deployed demo for each persona. Run targeted flows (e.g., `./tests/scripts/test-admin-user.sh`) or `./tests/scripts/run-all-tests.sh` after noteworthy UI, auth, or policy changes. Every script emits a timestamped Markdown checklist in `tests/reports/`; update the checkboxes with actual pass/fail status and capture screenshots or cURL traces when reproducing bugs.

## Commit & Pull Request Guidelines
Follow the existing short, conventional format: `<type>[: optional emoji] imperative summary` (`perf: speed up checkout list`, `🔧 fix admin pagination`). Reference related issues in the body, and mention Supabase schema or env updates explicitly. PRs must describe the problem, list the major changes, enumerate commands/tests executed, and attach UI screenshots for visible tweaks. Request review from both frontend and platform owners whenever touching `src/lib/supabase.ts` or anything under `supabase/functions/`.

## Security & Configuration Tips
Never commit credentials. Copy `.env.example` to `.env`, fill in Supabase keys, Stripe secrets, and role credentials, and keep the file untracked. Consult `环境变量配置指南.md` for variable meanings. Use the documented Stripe test card `4242 4242 4242 4242` during demos, and scrub user data from `tests/reports/` before sharing outside the team.
