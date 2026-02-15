# Active Plan: Implement FTR-M04

## Status
- Prepared.
- Implement `FTR-M04` (Offline fallback for last successful list) with cached list/detail reads and stale indicators, plus full validation coverage.

## Context
- FTR-M04 in `docs/FEATURES_FUTURE.md` requires cache-based offline/read-only fallback for pet data and clear freshness cues.
- Must remain frontend-only and keep the API contract unchanged.
- Align with `.agent/project_context.md` constraints and preserve existing filters, pagination, favorites, seen history, compare, modal actions, and URL state.

## Constraints
- Keep React + TypeScript + MUI only.
- Preserve core behaviors: tabs, filters, pagination, favorites, seen, compare, URL state, and modal actions.
- Keep persistence local-only (localStorage-backed) and no API contract changes.
- Keep responsive behavior for mobile and desktop.
- Continue honoring existing error handling and disclaimer/visibility patterns.

## Atomic Steps
1. Create offline cache helpers in `src/utils` for list and detail payload snapshots with validation and expiry logic.
   - Constraint mapping: local-only persistence and API contract stability.
2. Extend `App.tsx` list loading flow to read cached snapshots on fetch failure and update banner state for stale/fallback mode.
   - Constraint mapping: preserve existing tab/filter/pagination behavior.
3. Extend `PetModal.tsx` detail fetching flow to read cached details when online fetch fails.
   - Constraint mapping: read-only fallback should not mutate state unexpectedly.
4. Update footer copy and state wiring to communicate fresh/stale and offline-read status clearly.
   - Constraint mapping: clear trust signals, no new UI framework or color system.
5. Add/extend tests in `src/App.test.tsx` and add new cache utility tests for cache read/write and fallback behavior.
   - Constraint mapping: maintain Vitest + Testing Library + setup patterns.
6. Update `docs/FEATURES_FUTURE.md` for `FTR-M04` status to `Shipped`, owner, target version, implemented date, and notes.
7. Run `npm run test`, `npm run lint`, and `npm run build`, then report exact outcomes.
