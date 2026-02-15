import { APP_VERSION } from '../version';
import { normalizeCachedPet } from './offlineCache';
import { normalizeAdoptionChecklistStore, AdoptionChecklist } from './adoptionChecklist';
import { normalizeSearchPreset, SearchPreset } from './searchPresets';
import {
    FAVORITES_EXPIRATION_MS,
    FavoriteItem,
} from '../hooks/useFavorites';
import {
    SEEN_EXPIRATION_MS,
    SeenPet,
} from '../hooks/useSeenPets';

export const LOCAL_APP_STATE_SCHEMA = 'midland-animal-shelter-local-state';
export const LOCAL_APP_STATE_VERSION = 1;

interface UnknownRecord {
    [key: string]: unknown;
}

type TransferStatus = 'success' | 'error' | 'warning' | 'info';

export interface LocalAppStateStatus {
    message: string;
    severity: TransferStatus;
}

export interface LocalAppStateData {
    favorites: FavoriteItem[];
    seenPets: SeenPet[];
    seenEnabled: boolean;
    favoritesDisclaimerAccepted: boolean;
    searchPresets: SearchPreset[];
    adoptionChecklists: Record<number, AdoptionChecklist>;
}

export interface LocalAppStateExport {
    schema: string;
    version: number;
    exportedAt: number;
    appVersion: string;
    data: LocalAppStateData;
}

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
};

const parseBoolean = (value: unknown): boolean => {
    if (value === true || value === 'true') {
        return true;
    }

    if (value === false || value === 'false' || value === 0) {
        return false;
    }

    return false;
};

const normalizeFavorites = (value: unknown): FavoriteItem[] => {
    const now = Date.now();
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            const normalizedPet = normalizeCachedPet(entry);
            if (!normalizedPet || !isRecord(entry)) {
                return null;
            }

            const entryObj = entry as UnknownRecord;
            const savedAt = parseNumber(entryObj.savedAt, now);
            if (now - savedAt >= FAVORITES_EXPIRATION_MS) {
                return null;
            }

            return {
                ...normalizedPet,
                savedAt,
            };
        })
        .filter((item): item is FavoriteItem => item !== null);
};

const normalizeSeenPets = (value: unknown): SeenPet[] => {
    const now = Date.now();
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            if (!isRecord(entry)) {
                return null;
            }

            const id = parseNumber(entry.id, Number.NaN);
            if (!Number.isInteger(id) || id < 0) {
                return null;
            }

            const timestamp = parseNumber(entry.timestamp, now);
            if (now - timestamp >= SEEN_EXPIRATION_MS) {
                return null;
            }

            return {
                id,
                species: typeof entry.species === 'string' ? entry.species : '',
                timestamp,
            };
        })
        .filter((item): item is SeenPet => item !== null);
};

const normalizeSearchPresetList = (value: unknown): SearchPreset[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(normalizeSearchPreset)
        .filter((item): item is SearchPreset => item !== null);
};

const normalizeAdoptionChecks = (value: unknown): Record<number, AdoptionChecklist> => {
    return normalizeAdoptionChecklistStore(value);
};

const normalizeTransferData = (value: unknown): LocalAppStateData => {
    if (!isRecord(value)) {
        throw new Error('Backup file is not a valid object payload.');
    }

    return {
        favorites: normalizeFavorites(value.favorites),
        seenPets: normalizeSeenPets(value.seenPets),
        seenEnabled: parseBoolean(value.seenEnabled),
        favoritesDisclaimerAccepted: parseBoolean(value.favoritesDisclaimerAccepted),
        searchPresets: normalizeSearchPresetList(value.searchPresets),
        adoptionChecklists: normalizeAdoptionChecks(value.adoptionChecklists),
    };
};

export const buildLocalAppStateExport = (data: LocalAppStateData): LocalAppStateExport => ({
    schema: LOCAL_APP_STATE_SCHEMA,
    version: LOCAL_APP_STATE_VERSION,
    exportedAt: Date.now(),
    appVersion: APP_VERSION,
    data,
});

export const parseLocalAppStateImport = (rawText: string): LocalAppStateData => {
    let parsed: unknown;

    try {
        parsed = JSON.parse(rawText);
    } catch {
        throw new Error('Backup file is not valid JSON.');
    }

    if (!isRecord(parsed)) {
        throw new Error('Backup file is not a valid object.');
    }

    if (parsed.schema !== undefined) {
        if (parsed.schema !== LOCAL_APP_STATE_SCHEMA) {
            throw new Error('Unrecognized backup schema.');
        }

        if (typeof parsed.version === 'number' && parsed.version > LOCAL_APP_STATE_VERSION) {
            throw new Error('Backup file was created by a newer app version.');
        }
    }

    const payload = isRecord(parsed.data) ? parsed.data : parsed;
    return normalizeTransferData(payload);
};
