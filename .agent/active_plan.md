# Active Plan: SPA-Only Future Feature Backlog

## Context
- User requested running feature ideation to identify useful additions for this website.
- User explicitly constrained solutions to SPA-contained features (no backend/database now or later).

## Constraints
- Keep stack and patterns: React + TypeScript + MUI.
- Preserve current behavior flows: API fetch, tabs, filters, pagination, favorites, seen-history, disclaimer messaging, modal details.
- Do not introduce server-side persistence; all state must remain client-side (URL/localStorage/session).
- Keep responsive behavior and avoid anti-patterns listed in `.agent/project_context.md`.

## Atomic Steps
1. Audit current capabilities from `README.md`, `.agent/project_context.md`, and key `src` feature files to avoid duplicate ideas.
2. Rank candidate enhancements by user value while filtering out anything requiring a database/backend.
3. Create `docs/FEATURES_FUTURE.md` with High/Medium/Low sections, required tracking columns, and a progress snapshot.
4. Add top-3 execution guidance plus sequencing/dependency risks.
5. Run Sentinel constraint audit, then record durable lessons in project memory via Historian (and Chronicler if applicable).
