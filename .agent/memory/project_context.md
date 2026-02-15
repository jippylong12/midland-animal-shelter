# Project Memory

## Architectural Decisions
- Use a centralized MUI theme (`src/theme.ts`) plus global CSS variables (`src/index.css`) as the primary mechanism for visual design changes.
- Keep filtering and browsing logic in `src/App.tsx`, and keep UI controls in dedicated presentational components.
- Keep species tab selection indicator-only (yellow underline) and avoid selected tab pill backgrounds.
- Keep default brand green mapped to the original MUI green values (`green[500]` + `green[600]`) unless user requests a brand shift.
- Keep future feature work SPA-contained; no server/database dependencies should be introduced for roadmap items unless explicitly approved.

## Gotchas
- After adding new `@mui/icons-material` imports during dev, Vite may need a restart to avoid stale optimized dependency warnings/errors.
- The project should pass both lint and production build checks after UI refactors (`npm run lint`, `npm run build`).
