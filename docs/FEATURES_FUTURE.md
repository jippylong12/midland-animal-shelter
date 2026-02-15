# Features Future Backlog

This backlog is intentionally limited to SPA-contained features. No server, database, or backend persistence is assumed.

## Progress snapshot

| Metric | Value |
|---|---:|
| Total backlog items | 12 |
| Backlog | 8 |
| Planned | 0 |
| In Progress | 0 |
| Blocked | 0 |
| Shipped | 4 |
| Dropped | 0 |

## High

| ID | Suggestion | Why this matters | Status | Owner | Target Version | Implemented On | Notes |
|---|---|---|---|---|---|---|---|
| FTR-H01 | URL-synced filters and tab state (deep links) | Users can share exact search states and return where they left off, reducing repeated filtering effort. | Shipped | Engineering | v1.10 | 2026-02-15 | Keep all state in query params; preserve existing filter behavior. |
| FTR-H02 | New-match detection since last visit | Highlights newly listed pets per species, helping repeat visitors focus on fresh options quickly. | Shipped | Engineering | v1.10 | 2026-02-15 | Store last seen pet IDs/timestamps in localStorage; reset controls in UI. |
| FTR-H03 | Compare up to 3 pets side-by-side | Improves adoption decisions by reducing modal back-and-forth and making tradeoffs visible at once. | Shipped | Engineering | v1.11 | 2026-02-15 | Client-side compare tray with card/list side-by-side layout, favorites + seen markers, and card/modal compare actions. |
| FTR-H04 | Data freshness and stale-data banner | Builds trust during API delays by showing last successful sync time and clear stale-state messaging. | Shipped | Engineering | v1.11 | 2026-02-15 | Track fetch timestamp per tab in state/localStorage, and add stale-data banner with human-readable sync age. |

## Medium

| ID | Suggestion | Why this matters | Status | Owner | Target Version | Implemented On | Notes |
|---|---|---|---|---|---|---|---|
| FTR-M01 | Saved search presets (local only) | Frequent users can save common filter combinations and reapply in one click. | Shipped | Engineering | v1.12 | 2026-02-15 | Store named presets in localStorage with lightweight validation. |
| FTR-M02 | Adoption checklist and notes per pet | Helps households track decision criteria without leaving the app, increasing completion confidence. | Backlog | Unassigned | v1.12 |  | Persist checklist/notes locally and tie by pet ID. |
| FTR-M03 | Accessibility upgrade pass (keyboard + focus + SR labels) | Improves usability for keyboard and assistive tech users and reduces interaction friction on mobile. | Backlog | Unassigned | v1.13 |  | Add focus management for modal/tabs and aria labels for icon-only actions. |
| FTR-M04 | Offline fallback for last successful list | Keeps the app useful during temporary network issues by showing cached data with clear stale indicators. | Backlog | Unassigned | v1.13 |  | Cache list/detail responses in browser storage; read-only fallback mode. |

## Low

| ID | Suggestion | Why this matters | Status | Owner | Target Version | Implemented On | Notes |
|---|---|---|---|---|---|---|---|
| FTR-L01 | Copy/share pet summary text | Makes it easier for families to discuss candidates over text/email without screenshotting. | Backlog | Unassigned | v1.14 |  | Generate plain-text summary from existing fields; use clipboard API. |
| FTR-L02 | Personal fit scoring sliders (local preference model) | Adds lightweight decision support by ranking pets against user-set priorities. | Backlog | Unassigned | v1.14 |  | Pure client-side scoring; user controls weighting by age/size/stage/etc. |
| FTR-L03 | Export/import local app state | Lets users move favorites, seen history, presets, and notes between browsers manually. | Backlog | Unassigned | v1.15 |  | JSON export/import with validation; no cloud sync. |
| FTR-L04 | Compact card view toggle | Helps power users scan more pets per page on desktop while keeping the current default layout. | Backlog | Unassigned | v1.15 |  | UI-density switch stored locally; preserve responsive rules. |

## Top 3 next items

1. **FTR-M02 Accessibility upgrade pass (keyboard + focus + SR labels)**
   - Dependency: inventory icon-only controls and modal focus traps.
   - Risk: inconsistent accessibility patterns across existing icon actions.
2. **FTR-M03 Adoption checklist and notes per pet**
   - Dependency: consistent data model for pet-specific notes fields.
   - Risk: notes fields diverging from current card and modal expectations.
3. **FTR-M04 Offline fallback for last successful list**
   - Dependency: define cache invalidation and stale read policy.
   - Risk: stale data presenting as fresh if timestamps are mishandled.
