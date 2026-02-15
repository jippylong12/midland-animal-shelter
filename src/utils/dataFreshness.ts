export const DATA_FRESHNESS_KEY = 'shelter_last_successful_pet_sync_by_tab';
export const DATA_FRESHNESS_STALE_THRESHOLD_MS = 15 * 60 * 1000;

type RawSyncState = Record<string, unknown>;
export type PetTabSyncState = Record<number, number>;

export const normalizeSyncState = (value: unknown): PetTabSyncState => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    const normalized: PetTabSyncState = {};

    Object.entries(value as RawSyncState).forEach(([rawTab, rawValue]) => {
        const tab = Number(rawTab);
        const timestamp = Number(rawValue);

        if (!Number.isInteger(tab) || !Number.isFinite(timestamp)) {
            return;
        }

        if (timestamp <= 0) {
            return;
        }

        normalized[tab] = timestamp;
    });

    return normalized;
};

export const readPetListSyncState = (): PetTabSyncState => {
    try {
        const raw = localStorage.getItem(DATA_FRESHNESS_KEY);
        if (!raw) return {};
        return normalizeSyncState(JSON.parse(raw));
    } catch {
        return {};
    }
};

export const writePetListSyncState = (state: PetTabSyncState) => {
    try {
        localStorage.setItem(DATA_FRESHNESS_KEY, JSON.stringify(state));
    } catch {
        // Keep flow resilient if storage is unavailable.
    }
};

export const getSyncTimestampForTab = (state: PetTabSyncState, tabIndex: number): number | null => {
    return Object.prototype.hasOwnProperty.call(state, tabIndex) ? state[tabIndex] : null;
};

export const isDataStale = (timestamp: number | null, now = Date.now()) => {
    if (!timestamp) {
        return true;
    }

    return now - timestamp > DATA_FRESHNESS_STALE_THRESHOLD_MS;
};

export const formatSyncTime = (timestamp: number | null, locale = 'en-US') => {
    if (!timestamp) {
        return 'No sync recorded yet';
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(timestamp));
};

export const formatSyncAge = (timestamp: number | null, now = Date.now(), locale = 'en-US') => {
    if (!timestamp) {
        return 'No sync history';
    }

    const deltaMs = now - timestamp;
    const deltaMinutes = Math.floor(deltaMs / (60 * 1000));

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (deltaMinutes < 60) {
        return formatter.format(-deltaMinutes, 'minute');
    }

    const deltaHours = Math.floor(deltaMinutes / 60);
    if (deltaHours < 24) {
        return formatter.format(-deltaHours, 'hour');
    }

    const deltaDays = Math.floor(deltaHours / 24);
    return formatter.format(-deltaDays, 'day');
};
