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
- For local-only feature persistence, keep parsing/writing in dedicated utility modules that normalize payloads before state hydration (favorites, seen history, and now search presets).
- Keep `Filters` compact-by-default and gate lower-frequency controls behind an explicit advanced section to reduce visual density without changing callback/state contracts.
- For pet-specific local persistence features, keep data normalization/serialization in utility modules and expose narrow hooks in `App` to scope writes by stable IDs.
- For transient offline resilience, cache successful list/detail API responses in localStorage via dedicated utility modules, then hydrate fallback UI from cache before surfacing network errors.
- Reuse modal props as a transport for persisted, per-entity UI state (for example, checklist and notes in the details modal) rather than adding global modal-local mutation logic.
- Preserve keyboard and screen-reader accessibility state when opening/closing modals by capturing the active trigger and restoring focus deterministically after close.
- Require explicit accessible labels for icon-only controls (`aria-label`) and add consistent focus-visible cues before shipping accessibility-focused UI upgrades.
- Centralize modal share text generation in a utility (`src/utils/petSummary.ts`) and keep clipboard interaction in `PetModal` as a fallback-first flow (Clipboard API → legacy `execCommand`), returning explicit success/error messages.

## Gotchas
- After adding new `@mui/icons-material` imports during dev, Vite may need a restart to avoid stale optimized dependency warnings/errors.
- LocalStorage-backed offline caches should degrade gracefully when unavailable (quota errors or denied storage); prefer no hard fail and keep online flow unchanged.
- The project should pass both lint and production build checks after UI refactors (`npm run lint`, `npm run build`).
- MUI `useMediaQuery` requires a `window.matchMedia` stub in jsdom tests, or App-level tests will fail at render time.
- Keep test fixtures aligned to the COMAPI XML shapes (`ArrayOfXmlNode/XmlNode/adoptableSearch` for lists and `adoptableDetails` for modal details).
- Stale warnings should only be shown when a valid sync timestamp exists and exceeds the freshness threshold; treat missing history as “no sync yet” for informational messaging.
- Preset data in localStorage should be treated as untrusted: normalize filter values (including gender/sort/breed/age values) on read so malformed records cannot break the filters UI.
- When a localStorage-backed hook performs sequential updates in one event, prefer functional `setState` updates to avoid stale closure merges that can overwrite earlier mutations.
- App modal open/close flows can emit warnings and extra focus updates in tests unless assertions are scoped to user-visible behavior (`findByRole`, focus checks, and awaited closing transitions).

## Patterns & Recipes
- **Topic:** Pet-local state persistence
  - **Rule:** Store mutable per-entity UI states (e.g., checklist, notes) in `localStorage` by numeric entity ID with strict normalization on read/write.
  - **Reason:** This prevents malformed payloads from polluting runtime state and lets modal state survive tab/popup reopen while keeping UI logic localized.
- **Topic:** Clipboard sharing resilience
  - **Rule:** Keep copy/share text generation in `src/utils/petSummary.ts`, and in `PetModal` attempt `navigator.clipboard.writeText` first, then fallback to `document.execCommand('copy')` with an explicit user-facing error state when both paths fail.
  - **Reason:** This preserves a dependable share flow in modern browsers and older/jsdom-like contexts, with consistent copy success/failure messaging.
