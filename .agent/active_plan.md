## Status
- Completed on 2026-02-15.

# Active Plan: Implement FTR-H02 (New-Match Detection since Last Visit)

## Context
- Implement localStorage-backed new-match highlighting per species without changing API contracts or current core list behavior.

## Constraints
- Keep stack and patterns: React + TypeScript + MUI.
- Preserve current behavior flows: API fetch, tabs, filters, pagination, favorites, seen-history, disclaimer messaging, modal details.
- Maintain responsive behavior and avoid global state replacements for UI changes.
- Use local client state only (SPA-contained), per roadmap constraints.
- Validate changes with `npm run lint` and `npm run build` plus tests before completion.

## Atomic Steps
1. Inspect current pet list rendering and card component to determine how to mark "seen" and inject new-match state.
   Constraint mapping: do not change API parsing contracts or tab/filter/pagination logic.
2. Add a localStorage snapshot model keyed by species to persist last seen pet identifiers and timestamps for each species.
   Constraint mapping: robust parsing/versioning to avoid stale/invalid localStorage data and false new-match positives.
3. On successful data fetch, compare current pet IDs against stored snapshots and derive `isNewMatch` for current list items; include species-aware handling for mixed data ordering.
   Constraint mapping: avoid regressions in existing filtering/pagination and keep deterministic output for the same input.
4. Add a visible UI indicator for new pets and a reset control that clears persisted match history per species/global while keeping existing reset patterns.
   Constraint mapping: maintain MUI styling patterns and mobile-first responsive behavior.
5. Add tests for storage parsing, new-match computation, and end-to-end behavior in existing test suites.
   Constraint mapping: follow existing test conventions and shared setup (`src/test/setup.ts`).
6. Update `docs/FEATURES_FUTURE.md` status fields for `FTR-H02` and record decisions in project memory files per mandatory workflow.
7. Run verification commands (`npm run test`, `npm run lint`, `npm run build`) and report results.
