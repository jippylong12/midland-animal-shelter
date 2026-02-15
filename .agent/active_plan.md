## Status
- In progress.
- Refactor `src/components/Filters.tsx` to reduce layout complexity with a compact default view and expandable advanced controls.

# Active Plan: Refactor Filters UI Density

## Context
- User asked to make `Filters.tsx` less large/ungainly and suggested a compact + advanced approach.

## Constraints
- Keep React + TypeScript + MUI only.
- Preserve existing core behaviors: filter operations, preset save/apply/delete, seen-history disclaimer flow, and clear actions.
- Maintain mobile/desktop responsiveness.
- Avoid API contract or parent prop changes for this UI-only refactor.

## Atomic Steps
1. Identify high-frequency controls for a compact default section.
- Constraint mapping: keep current filters functional and easy to access on mobile and desktop.
2. Move lower-frequency controls/actions into an expandable advanced section (`Collapse`) controlled within `Filters.tsx`.
- Constraint mapping: preserve behavior and callback wiring without changing `FiltersProps`.
3. Keep preset and seen-history behaviors intact while reorganizing JSX into clearer grouped sections.
- Constraint mapping: do not remove consent/disclaimer messaging or existing local feature semantics.
4. Ensure labels, button text, and section headers make the compact/advanced split discoverable.
- Constraint mapping: preserve accessibility and current MUI interaction patterns.
