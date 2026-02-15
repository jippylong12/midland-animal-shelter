# Active Plan: Implement FTR-M02

## Status
- Completed.
- Implement `FTR-M02` (Adoption checklist and notes per pet) with localStorage persistence and test coverage.

## Context
- FTR-M02 in `docs/FEATURES_FUTURE.md` asks for an adoption checklist and notes, persisted on the client and tied by pet ID.
- Must remain frontend-only and keep the API contract unchanged.
- Align with `.agent/project_context.md` constraints.

## Constraints
- Keep React + TypeScript + MUI only.
- Preserve existing core behaviors: tabs, filters, pagination, favorites, seen, compare, URL state, and modal actions.
- Keep persistence local-only using browser storage and robust normalization on read.
- Maintain mobile/desktop responsiveness and existing accessibility patterns.

## Atomic Steps
1. Add a normalized checklist model and persistence helpers in `src/utils/adoptionChecklist.ts` using existing localStorage resilience patterns.
- Constraint mapping: no API contract changes and safe handling of malformed payloads.
2. Add `src/hooks/useAdoptionChecklist.ts` to hydrate, mutate, and persist checklist entries by pet ID.
- Constraint mapping: avoid global-state migration and keep local data flow close to `App`.
3. Wire checklist UI into `PetModal` and integrate callbacks through `App.tsx`.
- Constraint mapping: keep existing modal behavior for favorites/seen/compare and no API contract changes.
4. Add test coverage for hook persistence and modal checklist/notes UX flow.
- Constraint mapping: extend existing Vitest and React Testing Library suites.
5. Update `docs/FEATURES_FUTURE.md` with shipped status and verify `npm run test` + `npm run lint` + `npm run build`.
