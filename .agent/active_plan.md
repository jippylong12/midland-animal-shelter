## Status
- Completed.
- Implemented `FTR-M01` (saved search presets) end-to-end with localStorage persistence and preset controls.

# Active Plan: Implement FTR-M01 (Saved search presets)

## Context
- Implement `FTR-M01` from `docs/FEATURES_FUTURE.md`: allow users to store and reapply common search/filter states with one-click preset actions.

## Constraints
- Keep React + TypeScript + MUI only.
- Preserve current core behavior: API fetch, tabs, filters, pagination, favorites, seen history, modal details, and disclaimer.
- Maintain mobile/desktop responsiveness and existing tab/filter/query-state patterns.
- Use SPA-only client persistence (`localStorage`) and no backend/API contract changes.
- Validate with `npm run lint`, `npm run build`, and targeted test suite(s).

## Atomic Steps
1. Add `src/utils/searchPresets.ts` with localStorage read/write, schema normalization, and lightweight validation.
   - Constraint mapping: no API contract changes and resilient handling of malformed storage payloads.
2. Add preset save/apply/delete event handlers to `src/App.tsx` while reusing existing filter state shape.
   - Constraint mapping: keep current tabs, filters, and list rendering state in `App` as the source of truth.
3. Extend `src/components/Filters.tsx` to surface preset controls (save, apply, delete) with clear labels and affordances.
   - Constraint mapping: preserve existing MUI layout patterns and accessibility for existing controls.
4. Add utility tests (`src/utils/searchPresets.test.ts`) and App-level integration tests for preset behavior.
   - Constraint mapping: align with existing Vitest + RTL patterns.
5. Update `docs/FEATURES_FUTURE.md` to mark `FTR-M01` as shipped and refresh progress metrics.
6. Run `npm run lint`, `npm run test`, and `npm run build`.
