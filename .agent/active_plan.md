## Status
- Completed.

# Active Plan: Implement FTR-H04 (Data freshness and stale-data banner)

## Context
- Implement `FTR-H04` from `docs/FEATURES_FUTURE.md`: show last successful sync time and clear stale-state messaging without changing API contract.

## Constraints
- Keep React + TypeScript + MUI only.
- Preserve current core behavior: API fetch, tabs, filters, pagination, favorites, seen history, modal details, and disclaimer.
- Maintain mobile/desktop responsiveness and existing tab/filter/query-state patterns.
- Use SPA-only client persistence (`localStorage`) and no backend/API contract changes.
- Validate with `npm run lint`, `npm run build`, and targeted test suite(s).

## Atomic Steps
1. Add a client-side freshness tracker with per-tab timestamp persistence in `localStorage`.
   - Constraint mapping: no API contract changes; existing fetch pipeline remains intact.
2. Update app fetch flow to capture `Date.now()` only on successful list fetches and hydrate banner state from storage.
   - Constraint mapping: keep current data loading/error behavior stable.
3. Add stale detection logic with configurable interval threshold and clear stale-state messaging text.
   - Constraint mapping: avoid changing data schema or requiring server state.
4. Add a reusable freshness display component (banner/alert) and integrate it in app layout.
   - Constraint mapping: preserve MUI styling direction and existing layout hierarchy.
5. Extend `App.test.tsx` and add utility tests (if needed) to validate:
   - timestamp persistence across reloads,
   - stale threshold messaging,
   - and successful sync updates.
6. Update `docs/FEATURES_FUTURE.md` for `FTR-H04` status/date/notes.
7. Run `npm run lint`, `npm run build`, and `npm run test` for impacted suites.
