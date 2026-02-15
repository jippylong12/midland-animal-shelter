export const SEARCH_PRESET_STORAGE_KEY = 'shelter_search_presets';
const MAX_PRESET_NAME_LENGTH = 64;

export type SavedSearchGender = '' | 'Male' | 'Female';
export type SavedSearchSortBy = '' | 'breed' | 'age';

export interface SearchPresetFilters {
    searchQuery: string;
    breed: string[];
    gender: SavedSearchGender;
    age: {
        min: string;
        max: string;
    };
    stage: string;
    sortBy: SavedSearchSortBy;
    hideSeen: boolean;
}

export interface SearchPreset {
    id: string;
    name: string;
    selectedTab: number;
    filters: SearchPresetFilters;
    createdAt: number;
}

type UnknownObject = Record<string, unknown>;

const normalizePresetName = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    return trimmed.length > MAX_PRESET_NAME_LENGTH
        ? trimmed.slice(0, MAX_PRESET_NAME_LENGTH).trim()
        : trimmed;
};

const MAX_TAB_INDEX = 5;

const normalizeSelectedTab = (value: unknown): number => {
    const tab = Number(value);
    return Number.isInteger(tab) && tab >= 0 && tab <= MAX_TAB_INDEX ? tab : 0;
};

const normalizeGender = (value: unknown): SavedSearchGender => {
    if (value === 'Male' || value === 'Female' || value === '') return value;
    return '';
};

const normalizeAgeValue = (value: unknown): string => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Number.isInteger(value) && value > 0 ? String(value) : '';
    }

    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    return /^(0|[1-9]\d*)$/.test(trimmed) ? trimmed : '';
};

const normalizeStage = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeSortBy = (value: unknown): SavedSearchSortBy => {
    if (value === 'breed' || value === 'age') return value;
    return '';
};

const normalizeBreedList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];

    const unique = new Set<string>();
    value.forEach((item) => {
        if (typeof item !== 'string') return;
        const normalized = item.trim();
        if (normalized.length > 0) {
            unique.add(normalized);
        }
    });

    return Array.from(unique);
};

const normalizeBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value;
    return false;
};

export const normalizeSearchPresetFilters = (value: unknown): SearchPresetFilters => {
    const data = (value as UnknownObject) ?? {};
    const age = (data.age as UnknownObject) ?? {};

    return {
        searchQuery: normalizePresetName(data.searchQuery),
        breed: normalizeBreedList(data.breed),
        gender: normalizeGender(data.gender),
        age: {
            min: normalizeAgeValue(age.min),
            max: normalizeAgeValue(age.max),
        },
        stage: normalizeStage(data.stage),
        sortBy: normalizeSortBy(data.sortBy),
        hideSeen: normalizeBoolean(data.hideSeen),
    };
};

const normalizeSearchPreset = (value: unknown): SearchPreset | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

    const data = value as UnknownObject;
    const name = normalizePresetName(data.name);
    if (!name) return null;

    const createdAt = Number(data.createdAt);
    const fallbackCreatedAt = Date.now();

    return {
        id: normalizePresetName(data.id) || `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        selectedTab: normalizeSelectedTab(data.selectedTab),
        filters: normalizeSearchPresetFilters(data.filters),
        createdAt: Number.isFinite(createdAt) && createdAt > 0 ? createdAt : fallbackCreatedAt,
    };
};

export const createSearchPreset = (
    name: string,
    selectedTab: number,
    filters: SearchPresetFilters
): SearchPreset => ({
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: normalizePresetName(name),
    selectedTab: normalizeSelectedTab(selectedTab),
    filters: normalizeSearchPresetFilters(filters),
    createdAt: Date.now(),
});

export const readSearchPresets = (): SearchPreset[] => {
    try {
        const raw = localStorage.getItem(SEARCH_PRESET_STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        const presets = parsed
            .map((item) => normalizeSearchPreset(item))
            .filter((preset): preset is SearchPreset => preset !== null);

        const unique: SearchPreset[] = [];
        const seen = new Set<string>();

        presets.forEach((preset) => {
            const key = preset.name.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            unique.push(preset);
        });

        return unique;
    } catch {
        return [];
    }
};

export const writeSearchPresets = (presets: SearchPreset[]) => {
    try {
        const normalized = presets
            .map((preset) => normalizeSearchPreset(preset))
            .filter((preset): preset is SearchPreset => preset !== null);
        localStorage.setItem(SEARCH_PRESET_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
        // localStorage may be unavailable or full; keep app behavior resilient.
    }
};
