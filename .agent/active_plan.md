# Active Plan: Implement FTR-M03

## Status
- Completed.
- Implement `FTR-M03` (Accessibility upgrade pass) with keyboard focus and screen-reader upgrades, plus full integration test coverage.

## Context
- FTR-M03 in `docs/FEATURES_FUTURE.md` requests keyboard + focus + screen-reader upgrades for modal and icon-only controls.
- Must remain frontend-only and keep the API contract unchanged.
- Align with `.agent/project_context.md` constraints and maintain modal actions, filters, pagination, favorites, seen history, and compare behavior.

## Constraints
- Keep React + TypeScript + MUI only.
- Preserve core behaviors: tabs, filters, pagination, favorites, seen, compare, URL state, and modal actions.
- Keep persistence local-only; no API contract changes.
- Maintain mobile and desktop responsiveness.

## Atomic Steps
1. Add explicit screen-reader labels and keyboard-visible focus styles for icon-only actions in pet cards and modal headers.
   - Constraint mapping: avoid altering primary interaction patterns or API behavior.
2. Add modal focus management in `App.tsx` and `PetModal.tsx` to ensure deterministic focus on open and return-to-trigger behavior on close.
   - Constraint mapping: preserve modal lifecycle and existing close semantics.
3. Add RTL coverage in `src/App.test.tsx` for labeled icon actions and focus return flow.
   - Constraint mapping: stay within the current Vitest + Testing Library stack.
4. Update `docs/FEATURES_FUTURE.md` status fields and progress snapshot for `FTR-M03`.
   - Constraint mapping: keep roadmap formatting and history intact.
5. Run `npm run test`, `npm run lint`, and `npm run build`, then report exact outcomes.
