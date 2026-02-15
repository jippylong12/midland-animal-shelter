# Active Plan: Comprehensive Test Suite

## Context
- User asked for a best-effort test suite to ensure the application works end-to-end.

## Constraints
- Keep stack and patterns: React + TypeScript + MUI.
- Preserve current behavior flows: API fetch, tabs, filters, pagination, favorites, seen-history, disclaimer messaging, modal details.
- Keep responsive behavior and avoid anti-patterns listed in `.agent/project_context.md`.
- Validate resulting changes with the project-required checks (`npm run lint` and `npm run build`) plus tests once implemented.

## Atomic Steps
1. Inspect current test setup and scripts in `package.json` and existing test files to identify gaps.
   Constraint mapping: avoid changing product behavior while adding test coverage.
2. Add or improve test tooling/config only if needed for stable, maintainable tests in the current React + TypeScript stack.
   Constraint mapping: no alternate framework shifts, no changes to runtime feature logic.
3. Implement high-value unit/integration tests for core user flows: fetch/render, species tabs, filters, pagination, favorites, seen-history, and modal details.
   Constraint mapping: assert existing behavior contracts rather than redefining them.
4. Add focused edge-case tests for critical states (loading, empty, error, persistence boundaries) where practical.
   Constraint mapping: keep tests aligned with current UI behavior and messaging.
5. Run verification commands and fix test failures caused by test code changes.
   Constraint mapping: keep app buildable and lint-clean.
6. Run Sentinel constraint audit and update durable project memory via Chronicler and Historian.
