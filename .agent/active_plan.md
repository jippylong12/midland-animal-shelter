# Active Plan: FTR-L04 (Compact card view toggle)

## Constraints
- Preserve existing React + TypeScript + MUI stack.
- Keep state flow local; avoid introducing new state managers.
- Preserve existing tabs/filter/pagination behaviors.

## Plan
1. Add compact card preference state in App-level persistence flow and include it in local-state serialization.
2. Add a Settings control for list density and wire it to card/list rendering.
3. Tune `PetList` and `PetCard` layout behavior for compact mode while preserving desktop default density.
4. Extend local state parsing/write tests and App integration tests for export/import + user preference persistence.
5. Run required validation commands in order: `npm run test`, `npm run lint`, `npm run build`.
6. Mark FTR-L04 as shipped and update memory references for UI-density persistence behavior.
