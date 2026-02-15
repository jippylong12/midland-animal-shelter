# Active Plan: Implement FTR-L01

## Status
- Prepared.
- Implement `FTR-L01` (Copy/share pet summary text) with a modal-first sharing flow, resilient clipboard behavior, and test coverage.

## Context
- `FTR-L01` in `docs/FEATURES_FUTURE.md` requests plain-text summary generation from existing pet fields and share/copy support.
- Must remain frontend-only and avoid API contract changes.
- Preserve existing core behaviors: tabs, filters, pagination, favorites, seen-history, compare, and modal flow.

## Constraints
- Keep React + TypeScript + MUI with existing theming; no alternate UI framework.
- Keep core behaviors unchanged: URL state, tabs, filters, pagination, favorites/seen/compare, modal details.
- No API schema changes; persist any new feature data client-side only.
- Maintain mobile + desktop responsive quality.
- Preserve accessibility and focus behavior patterns already established.

## Atomic Steps
1. Add a reusable plain-text summary generator for `AdoptableDetails` and utility-level formatting helpers (age, optional fields, stable copy body).
   - Constraint mapping: keeps formatting centralized and avoids duplicating logic.
2. Extend `PetModal` with a dedicated copy/share action in modal actions.
   - Constraint mapping: keep user interaction within existing modal UX and avoid changing list flow.
3. Implement resilient copy behavior in `PetModal`:
   - Prefer `navigator.clipboard.writeText`.
   - Graceful fallback to hidden textarea + `document.execCommand('copy')` when modern clipboard is unavailable.
   - Surface success/error feedback with clear status text.
4. Add focused UI/UX treatment (disabled state while loading, inline status chips/smaller typography, clear aria labels) consistent with current visual language.
   - Constraint mapping: maintain accessibility and no icon-only ambiguity.
5. Add test coverage for summary generation, copy success path, and fallback path in `src/App.test.tsx` (and utility test if extracted).
   - Constraint mapping: use Vitest + RTL + localStorage/DOM setup patterns.
6. Update `docs/FEATURES_FUTURE.md`:
   - Set `FTR-L01` status to `Shipped` with owner/version/date and notes.
   - Update progress snapshot totals.
7. Run `npm run test`, `npm run lint`, and `npm run build` in order and report exact outcomes.
