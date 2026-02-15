import { AdoptableSearch } from '../types';

export const NEW_MATCH_STORAGE_KEY = 'shelter_new_match_snapshots';

export interface SpeciesNewMatchRecord {
    ids: string[];
    updatedAt: number;
}

export type NewMatchStorage = Record<string, SpeciesNewMatchRecord>;

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === 'string');

const isSpeciesRecord = (value: unknown): value is SpeciesNewMatchRecord => {
    if (!value || typeof value !== 'object') return false;
    const record = value as SpeciesNewMatchRecord;
    return isStringArray(record.ids) && typeof record.updatedAt === 'number';
};

const normalizeSpeciesKey = (species: string) => species.trim().toLowerCase();
const normalizePetId = (petId: number | string | null | undefined) => {
    if (petId === null || petId === undefined) return null;
    const value = String(petId).trim();
    return value.length > 0 ? value : null;
};

export const getPetMatchKey = (pet: Pick<AdoptableSearch, 'Species' | 'ID'>): string | null => {
    const speciesKey = normalizeSpeciesKey(pet.Species);
    const id = normalizePetId(pet.ID);
    if (!speciesKey || !id) return null;
    return `${speciesKey}|${id}`;
};

export const getSpeciesMatchKey = (species: string) => normalizeSpeciesKey(species);

export const readNewMatchStorage = (): NewMatchStorage => {
    try {
        const raw = localStorage.getItem(NEW_MATCH_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return {};

        const result: NewMatchStorage = {};
        Object.entries(parsed).forEach(([speciesKey, value]) => {
            if (typeof speciesKey !== 'string' || !isSpeciesRecord(value)) return;
            result[normalizeSpeciesKey(speciesKey)] = {
                ids: Array.from(new Set(value.ids.map((id) => id.trim()).filter(Boolean))),
                updatedAt: value.updatedAt,
            };
        });
        return result;
    } catch (error) {
        console.error('Failed to read new-match storage', error);
        return {};
    }
};

export const writeNewMatchStorage = (store: NewMatchStorage) => {
    localStorage.setItem(NEW_MATCH_STORAGE_KEY, JSON.stringify(store));
};

export const computeNewMatches = (pets: AdoptableSearch[], store: NewMatchStorage, now = Date.now()) => {
    const nextStore: NewMatchStorage = { ...store };
    const speciesBuckets = new Map<string, Set<string>>();
    const newMatchIds = new Set<string>();

    pets.forEach((pet) => {
        const speciesKey = getSpeciesMatchKey(pet.Species);
        const petId = normalizePetId(pet.ID);
        if (!speciesKey || !petId) return;
        const ids = speciesBuckets.get(speciesKey) ?? new Set<string>();
        ids.add(petId);
        speciesBuckets.set(speciesKey, ids);
    });

    speciesBuckets.forEach((ids, speciesKey) => {
        const previous = store[speciesKey];
        if (previous && Array.isArray(previous.ids)) {
            const previousSet = new Set(previous.ids);
            ids.forEach((id) => {
                if (!previousSet.has(id)) {
                    newMatchIds.add(`${speciesKey}|${id}`);
                }
            });
        }

        nextStore[speciesKey] = {
            ids: Array.from(ids),
            updatedAt: now,
        };
    });

    return {
        newMatchIds,
        nextStore,
    };
};

export const clearSpeciesNewMatchHistory = (
    store: NewMatchStorage,
    speciesToClear: string[],
    allPets: AdoptableSearch[],
    now = Date.now()
) => {
    const nextStore = { ...store };
    const normalizedSpecies = new Set(speciesToClear.map(getSpeciesMatchKey).filter(Boolean));
    const speciesBuckets = new Map<string, Set<string>>();

    allPets.forEach((pet) => {
        const speciesKey = getSpeciesMatchKey(pet.Species);
        const petId = normalizePetId(pet.ID);
        if (!speciesKey || !petId || !normalizedSpecies.has(speciesKey)) return;

        const ids = speciesBuckets.get(speciesKey) ?? new Set<string>();
        ids.add(petId);
        speciesBuckets.set(speciesKey, ids);
    });

    normalizedSpecies.forEach((speciesKey) => {
        nextStore[speciesKey] = {
            ids: Array.from(speciesBuckets.get(speciesKey) ?? []),
            updatedAt: now,
        };
    });

    return nextStore;
};
