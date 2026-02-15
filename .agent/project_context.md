# Project Context

## Constraints
- Keep the app on React + TypeScript + MUI; do not introduce alternate UI frameworks.
- Preserve existing core behaviors: API fetch, tabs, filters, pagination, favorites, seen-history, and modal details.
- Keep responsive behavior for mobile and desktop as a first-class requirement.
- Validate frontend changes with `npm run lint` and `npm run build` before completion.

## Anti-Patterns
- Do not replace established state flow with global state libraries for simple UI changes.
- Do not remove disclaimer/favorites consent messaging.
- Do not change API contract assumptions in UI-only tasks.

## Patterns & Recipes
- **Topic:** UI refreshes in this codebase
- **Rule:** Drive look-and-feel through `src/theme.ts` plus lightweight global CSS tokens, then update component surfaces (`Header`, `Filters`, `PetCard`, `PetModal`) without changing data flow.
- **Reason:** This keeps behavior stable while allowing fast visual redesigns.

- **Topic:** MUI icon dependency refresh during local dev
- **Rule:** If a newly imported MUI icon triggers transient invalid-hook/duplicate-emotion warnings in Vite dev, restart the dev server and reload.
- **Reason:** Vite optimized deps can temporarily mix old/new prebundles until a fresh restart.

- **Topic:** Tab selection styling
- **Rule:** Keep species tabs on an indicator-only selected state (yellow underline) and avoid selected pill/circle tab backgrounds.
- **Reason:** The product preference is cleaner tab emphasis with only the underline cue.

- **Topic:** Brand green baseline
- **Rule:** Default brand green should stay on the original MUI green family (`green[500]`/`green[600]`) unless a redesign is explicitly requested.
- **Reason:** Preserves the established visual identity users expect.

- **Topic:** Future feature scope for this product
- **Rule:** Keep roadmap features SPA-contained by default, using only client-side persistence patterns (URL params, localStorage/sessionStorage, in-memory state, or browser cache).
- **Reason:** The project is intentionally a frontend-only deployment with no backing database or server-owned user state.

- **Topic:** Frontend regression testing baseline
- **Rule:** Use Vitest + React Testing Library with a shared jsdom setup (`src/test/setup.ts`) that stubs `matchMedia`, clears localStorage, and resets mocks; cover core product behavior with App integration tests plus hook unit tests.
- **Reason:** This catches regressions in fetch/tabs/filters/pagination/modal and localStorage-backed favorites/seen-history without changing runtime data flow.

- **Topic:** URL-synced navigation state
- **Rule:** Keep tab/filter/page state in query params through explicit `parse`/`build` helpers, and only re-emit to history when state is valid; restore on `popstate` with guarded pagination clamping.
- **Reason:** It enables deep-linking and back/forward restoration for complex list filters without introducing route libraries or losing UX semantics during transient loading states.

- **Topic:** Local-only feature persistence
- **Rule:** Normalize and sanitize all client-persisted feature data at the utility boundary before hydration to prevent malformed payloads from mutating UI state.
- **Reason:** Roadmap features that rely on localStorage (favorites, seen history, presets) must be robust against legacy/corrupt payloads and still keep core behavior stable.

- **Topic:** New-match detection without API contract changes
- **Rule:** Store previous visible species snapshots in localStorage using normalized keys (`species|id`) and update snapshots after each successful list fetch.
- **Reason:** This allows “new since last visit” highlighting and reset semantics entirely on the client while preventing accidental mismatches from case/spelling variations.
- **Topic:** Data freshness without API contract changes
- **Rule:** Persist last-successful sync timestamps in localStorage per tab (tab index keys) and display fresh/stale banners derived from those values.
- **Reason:** This keeps API contracts untouched while surfacing trust signals for delayed/stale list data.

- **Topic:** Non-critical trust signals in footer
- **Rule:** When existing trust indicators become visually noisy, render them in compact footer caption form and hide them on non-listing contexts (e.g., favorites tab), while preserving wording and stale detection semantics.
- **Reason:** This preserves important user trust context without destabilizing the primary browsing flow or changing data/state logic.
