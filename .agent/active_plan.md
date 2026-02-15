# Active Plan: Implement FTR-L02

## Status
- Completed.
- Move personal-fit controls into a dedicated `Settings` top tab, keep the feature opt-in via toggle, and keep score-based ranking disabled until enabled.
- Preserve existing core behaviors: API fetch, tabs, filters, pagination, favorites, seen-history, compare, and modal details.

## Context
- `FTR-L02` in `docs/FEATURES_FUTURE.md` is marked `Shipped`.
- The app is React + TypeScript + MUI with client-only persistence and deep-linkable filter state.

## Constraints
- Keep React + TypeScript + MUI; do not introduce alternate UI frameworks.
- Do not alter API contract or fetching model (species endpoints remain unchanged).
- Keep responsive behavior first-class on mobile and desktop.
- Preserve existing core behaviors and modal/a11y flows.
- Persist preference model in localStorage only; validate and sanitize hydration.
- Keep local ranking deterministic and URL-synced where applicable.
- Follow existing theme patterns and centralized token usage.

## Atomic Steps
1. Add a local scoring domain model in a new utility:
   - Define preferences schema with slider weights.
   - Add normalization/parsing for localStorage.
   - Add score + explainability helpers for list cards.
   - Constraint mapping: keeps persistence and score logic isolated and tested.
2. Add a dedicated `Settings` tab and move preference controls there:
   - Add `Settings` to tab config and route list/detail rendering to tab kind.
   - Preserve list views on `fetch` tabs and hide listing controls when on settings.
   - Add explanatory copy around score provenance and ownership.
   - Constraint mapping: clarifies where preferences come from and avoids confusion.
3. Extend URL and application state in `App.tsx`:
   - Add scoring preferences state initialized from localStorage.
   - Persist preference changes to localStorage.
   - Add sort option for score-only ranking using computed match scores.
   - Compute sorted list ordering with stable tie-breakers and keep pagination behavior unchanged.
4. Surface score in cards and modal context:
   - Re-use existing score chip/progress in `PetCard` and modal header badge.
   - Ensure sort option and score badges only appear when personal fit is enabled.
   - Constraint mapping: improves UX without changing modal semantics.
5. Add full tests:
   - New utility tests for scoring outputs and persistence behavior.
   - App-level tests for scoring slider control, persistence, URL interaction, and ranking by score.
6. Validate and document:
   - Mark `FTR-L02` shipped with date, owner, notes.
   - Update progress snapshot totals and top-3 list if needed.
7. Run `npm run test`, `npm run lint`, `npm run build` in that order and report exact pass/fail.
