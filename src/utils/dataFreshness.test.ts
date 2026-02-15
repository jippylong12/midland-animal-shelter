import {
    DATA_FRESHNESS_KEY,
    DATA_FRESHNESS_STALE_THRESHOLD_MS,
    formatSyncAge,
    getSyncTimestampForTab,
    isDataStale,
    normalizeSyncState,
    readPetListSyncState,
    writePetListSyncState,
} from './dataFreshness';

describe('dataFreshness', () => {
    it('normalizes malformed sync state payloads', () => {
        const normalized = normalizeSyncState({
            0: 1700000000000,
            dog: 'bad',
            1: '1700000001000',
            2: -5,
            3: null,
            4: 0,
            5: 1700000015000,
        });

        expect(normalized).toEqual({
            0: 1700000000000,
            1: 1700000001000,
            5: 1700000015000,
        });
    });

    it('reads and writes sync timestamps from localStorage', () => {
        localStorage.setItem(DATA_FRESHNESS_KEY, JSON.stringify({ 0: 1700000000000, 2: 1700000002000 }));

        const state = readPetListSyncState();
        expect(state).toEqual({ 0: 1700000000000, 2: 1700000002000 });

        writePetListSyncState({ ...state, 1: 1700000010000 });

        expect(JSON.parse(localStorage.getItem(DATA_FRESHNESS_KEY) || '{}')).toEqual({
            0: 1700000000000,
            1: 1700000010000,
            2: 1700000002000,
        });

        expect(getSyncTimestampForTab(state, 2)).toBe(1700000002000);
    });

    it('detects stale sync timestamps and renders readable age text', () => {
        const now = 1_700_000_000_000;
        const freshTimestamp = now - Math.floor(DATA_FRESHNESS_STALE_THRESHOLD_MS / 2);
        const staleTimestamp = now - (DATA_FRESHNESS_STALE_THRESHOLD_MS + 1000);

        expect(isDataStale(freshTimestamp, now)).toBe(false);
        expect(isDataStale(staleTimestamp, now)).toBe(true);

        expect(formatSyncAge(freshTimestamp, now)).toContain('minute');
        expect(formatSyncAge(staleTimestamp, now)).toContain('minute');
    });
});
