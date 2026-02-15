# Project Memory

## Architectural Decisions
- Use a centralized MUI theme (`src/theme.ts`) plus global CSS variables (`src/index.css`) as the primary mechanism for visual design changes.
- Keep filtering and browsing logic in `src/App.tsx`, and keep UI controls in dedicated presentational components.
- Keep species tab selection indicator-only (yellow underline) and avoid selected tab pill backgrounds.
- Keep default brand green mapped to the original MUI green values (`green[500]` + `green[600]`) unless user requests a brand shift.
- Keep future feature work SPA-contained; no server/database dependencies should be introduced for roadmap items unless explicitly approved.
- Standardize frontend testing on Vitest + React Testing Library + jsdom, with shared setup in `vitest.config.ts` and `src/test/setup.ts`.
- Keep client-side deep links in sync by treating URL query params as the source-of-truth cache for `selectedTab`, filters, and page, with explicit sanitization of invalid values.
- Use controlled hydration guards during popstate + refetch transitions so query-driven pagination does not get clamped to page 1 before restored data is loaded.
- Track cross-visit changes via normalized localStorage snapshots keyed by species + pet ID, then derive “new match” indicators from set-difference logic without changing API contracts.
- Track successful list sync timestamps by tab index in localStorage to support freshness and staleness messaging without API contract changes.
- For non-critical trust signals, prefer pushing informational copy to `Footer` instead of inline page alerts when the requirement is to reduce visual prominence.

## Gotchas
- After adding new `@mui/icons-material` imports during dev, Vite may need a restart to avoid stale optimized dependency warnings/errors.
- The project should pass both lint and production build checks after UI refactors (`npm run lint`, `npm run build`).
- MUI `useMediaQuery` requires a `window.matchMedia` stub in jsdom tests, or App-level tests will fail at render time.
- Keep test fixtures aligned to the COMAPI XML shapes (`ArrayOfXmlNode/XmlNode/adoptableSearch` for lists and `adoptableDetails` for modal details).
- Stale warnings should only be shown when a valid sync timestamp exists and exceeds the freshness threshold; treat missing history as “no sync yet” for informational messaging.
