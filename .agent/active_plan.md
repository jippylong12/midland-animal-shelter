# Active Plan: Implement FTR-H01 (URL-Synced Filters + Tabs)

## Context
- Implement deep-link state for filter and tab UI and validate with unit/integration tests.

## Constraints
- Keep stack and patterns: React + TypeScript + MUI.
- Preserve current behavior flows: API fetch, tabs, filters, pagination, favorites, seen-history, disclaimer messaging, modal details.
- Keep responsive behavior and avoid anti-patterns listed in `.agent/project_context.md`.
- Validate resulting changes with the project-required checks (`npm run lint` and `npm run build`) plus tests once implemented.

## Atomic Steps
1. Add URL parse/build utilities for tab and filter states in `src/App.tsx`.
   Constraint mapping: keep tab/filter defaults identical when params are absent or invalid.
2. Initialize app state from `window.location.search` and keep tab/filter/page in sync with `history.replaceState`.
   Constraint mapping: no behavior changes outside query-managed state; preserve reset-on-tab-change behavior.
3. Add `popstate` hydration so browser back/forward restores filters, tab, and page.
   Constraint mapping: avoid introducing route libraries; keep SPA client-only state flow.
4. Add integration tests in `src/App.test.tsx` for deep-link hydration, state persistence in URL, and `popstate` restoration.
   Constraint mapping: keep test assertions anchored to current UI controls/behavior.
5. Run verification commands (`npm run test`, `npm run lint`, `npm run build`) and capture outcomes.
6. Update project memory records (Sentinel/Chronicler/Historian) to reflect the feature decision and implementation outcome.
