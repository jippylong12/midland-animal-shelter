# Active Plan: GA4 Normalized Tracking

## Constraints
- Preserve existing React + TypeScript + MUI stack; no new dependencies.
- Do not change UI behavior, routing semantics, styling, or link destinations.
- Keep edits minimal and local to analytics wiring + metadata attributes.
- Validate frontend changes with `npm run lint` and `npm run build` before completion.

## Plan
1. Add GA4 bootstrap script tags to `index.html` head using measurement ID `G-B24WEF5K6V`.
2. Create a reusable analytics utility with safe `trackEvent`, URL sanitization, internal-domain helper, one delegated link-click listener, and SPA route-change `page_view` emission.
3. Initialize analytics once from app entrypoint without affecting render/UI flow.
4. Instrument key non-link UI interactions with normalized `portfolio_ui_interaction` plus legacy companion events.
5. Add `data-ga-section`, `data-ga-kind`, `data-ga-item`, and `data-ga-label` attributes to key link surfaces for cleaner reporting dimensions.
6. Run `npm run lint` and `npm run build`, then complete Sentinel/Historian/Chronicler updates.
