import { useState, useEffect, useCallback } from 'react';
import { AdoptableSearch } from '../types';

export const SEEN_PETS_STORAGE_KEY = 'seenPets';
export const SEEN_ENABLED_STORAGE_KEY = 'seenPetsEnabled';
export const SEEN_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SeenPet {
    id: number;
    species: string;
    timestamp: number;
}

type UnknownRecord = Record<string, unknown>;

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

const parseString = (value: unknown): string => (typeof value === 'string' ? value : '');

const normalizeSeenPet = (value: unknown, fallbackTimestamp: number): SeenPet | null => {
    if (!isRecord(value)) {
        return null;
    }

    const id = parseNumber(value.id, Number.NaN);
    if (!Number.isInteger(id) || id < 0) {
        return null;
    }

    const timestamp = parseNumber(value.timestamp, fallbackTimestamp);
    return {
        id,
        species: parseString(value.species),
        timestamp,
    };
};

const normalizeSeenPets = (value: unknown): SeenPet[] => {
    const now = Date.now();

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => normalizeSeenPet(entry, now))
        .filter((item): item is SeenPet => Boolean(item))
        .filter((item) => now - item.timestamp < SEEN_EXPIRATION_MS);
};

const readSeenPetsFromStorage = (): SeenPet[] => {
    try {
        const storedSeenPets = localStorage.getItem(SEEN_PETS_STORAGE_KEY);
        if (!storedSeenPets) {
            return [];
        }

        const parsed = JSON.parse(storedSeenPets);
        return normalizeSeenPets(parsed);
    } catch (error) {
        console.error('Failed to parse seen pets from localStorage', error);
        return [];
    }
};

const writeSeenPetsToStorage = (seenPets: SeenPet[]) => {
    try {
        localStorage.setItem(SEEN_PETS_STORAGE_KEY, JSON.stringify(seenPets));
    } catch (error) {
        console.error('Error saving seen pet state', error);
    }
};

const writeSeenEnabledToStorage = (enabled: boolean) => {
    try {
        localStorage.setItem(SEEN_ENABLED_STORAGE_KEY, JSON.stringify(enabled));
    } catch (error) {
        console.error('Error saving seen feature state', error);
    }
};

export const useSeenPets = () => {
    const [isSeenEnabled, setIsSeenEnabled] = useState<boolean>(() => {
        try {
            const storedEnabled = localStorage.getItem(SEEN_ENABLED_STORAGE_KEY);
            return storedEnabled ? JSON.parse(storedEnabled) : false;
        } catch {
            return false;
        }
    });

    const [seenPets, setSeenPets] = useState<SeenPet[]>(() => readSeenPetsFromStorage());

    // Persist changes to localStorage
    useEffect(() => {
        writeSeenEnabledToStorage(isSeenEnabled);
    }, [isSeenEnabled]);

    useEffect(() => {
        writeSeenPetsToStorage(seenPets);
    }, [seenPets]);

    const replaceSeenState = useCallback((nextSeenPets: SeenPet[]) => {
        const sanitized = normalizeSeenPets(nextSeenPets);
        setSeenPets(sanitized);
    }, []);

    const setSeenEnabled = useCallback((next: boolean) => {
        setIsSeenEnabled(next);
    }, []);

    const toggleSeenFeature = useCallback(() => {
        setIsSeenEnabled((prev) => !prev);
    }, []);

    const markAsSeen = useCallback((pet: AdoptableSearch) => {
        if (!isSeenEnabled) return;

        setSeenPets(prev => {
            if (prev.some(p => p.id === pet.ID && p.species === pet.Species)) {
                return prev;
            }

            const next = [...prev, { id: pet.ID, species: pet.Species, timestamp: Date.now() }];
            return next;
        });
    }, [isSeenEnabled]);

    const markAllAsSeen = useCallback((pets: AdoptableSearch[]) => {
        if (!isSeenEnabled) return;

        setSeenPets(prev => {
            const newSeenPets = [...prev];
            const now = Date.now();
            let changed = false;

            pets.forEach((pet) => {
                if (!prev.some(p => p.id === pet.ID && p.species === pet.Species)) {
                    newSeenPets.push({ id: pet.ID, species: pet.Species, timestamp: now });
                    changed = true;
                }
            });

            if (!changed) {
                return prev;
            }
            return newSeenPets;
        });
    }, [isSeenEnabled]);

    const isSeen = useCallback((pet: AdoptableSearch) => {
        if (!isSeenEnabled) return false;
        return seenPets.some(p => p.id === pet.ID && p.species === pet.Species);
    }, [seenPets, isSeenEnabled]);

    return {
        seenPets,
        isSeenEnabled,
        toggleSeenFeature,
        markAsSeen,
        markAllAsSeen,
        isSeen,
        replaceSeenState,
        setSeenEnabled,
    };
};
