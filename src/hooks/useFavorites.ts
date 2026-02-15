import { useState, useEffect, useCallback } from 'react';
import { AdoptableSearch } from '../types';
import { normalizeCachedPet } from '../utils/offlineCache';

export const FAVORITES_STORAGE_KEY = 'shelter_favorites';
export const FAVORITES_DISCLAIMER_KEY = 'shelter_favorites_disclaimer';
export const FAVORITES_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface FavoriteItem extends AdoptableSearch {
    savedAt: number;
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
        if (Number.isFinite(parsed)) return parsed;
    }

    return fallback;
};

const normalizeFavorite = (value: unknown, fallbackSavedAt: number): FavoriteItem | null => {
    const normalizedPet = normalizeCachedPet(value);
    if (!normalizedPet || !isRecord(value)) {
        return null;
    }

    return {
        ...normalizedPet,
        savedAt: parseNumber(value.savedAt, fallbackSavedAt),
    };
};

const readFavoritesFromStorage = (): FavoriteItem[] => {
    const now = Date.now();
    try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!storedFavorites) return [];

        const parsed = JSON.parse(storedFavorites);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((item) => normalizeFavorite(item, now))
            .filter((item): item is FavoriteItem => Boolean(item))
            .filter((item) => now - item.savedAt < FAVORITES_EXPIRATION_MS)
            .map((item) => ({
                ...item,
                savedAt: now,
            }));
    } catch (error) {
        console.error('LocalStorage not supported or error parsing', error);
        return [];
    }
};

const sanitizeFavoriteList = (favorites: FavoriteItem[]): FavoriteItem[] => {
    const now = Date.now();

    return favorites
        .map((item) => normalizeFavorite(item, now))
        .filter((item): item is FavoriteItem => Boolean(item))
        .filter((item) => now - item.savedAt < FAVORITES_EXPIRATION_MS);
};

export const writeFavoriteItems = (favorites: FavoriteItem[]) => {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error('Error saving to localStorage', e);
    }
};

const writeDisclaimerAccepted = (accepted: boolean) => {
    try {
        if (accepted) {
            localStorage.setItem(FAVORITES_DISCLAIMER_KEY, 'true');
            return;
        }

        localStorage.removeItem(FAVORITES_DISCLAIMER_KEY);
    } catch (e) {
        console.error('Error saving disclaimer status', e);
    }
};

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>(() => readFavoritesFromStorage());
    const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
    const [pendingFavorite, setPendingFavorite] = useState<AdoptableSearch | null>(null);

    // Load disclaimer acceptance from localStorage
    useEffect(() => {
        try {
            const storedDisclaimer = localStorage.getItem(FAVORITES_DISCLAIMER_KEY);
            setDisclaimerAccepted(storedDisclaimer === 'true');
        } catch (error) {
            console.error('LocalStorage not supported or error parsing', error);
        }
    }, []);

    const saveFavorites = (newFavorites: FavoriteItem[]) => {
        const normalized = sanitizeFavoriteList(newFavorites);
        setFavorites(normalized);
        writeFavoriteItems(normalized);
        return normalized;
    };

    const addFavorite = useCallback((pet: AdoptableSearch) => {
        const now = Date.now();

        setFavorites(prev => {
            if (prev.some(f => f.ID === pet.ID)) return prev;
            const newFavs = [...prev, { ...pet, savedAt: now }];
            return saveFavorites(newFavs);
        });
    }, []);

    const removeFavorite = useCallback((petID: number) => {
        setFavorites((prev) => {
            const newFavs = prev.filter((f) => f.ID !== petID);
            return saveFavorites(newFavs);
        });
    }, []);

    const toggleFavorite = useCallback((pet: AdoptableSearch) => {
        const isFav = favorites.some((f) => f.ID === pet.ID);
        if (isFav) {
            removeFavorite(pet.ID);
            return;
        }

        if (!disclaimerAccepted) {
            setPendingFavorite(pet);
            setIsDisclaimerOpen(true);
            return;
        }

        addFavorite(pet);
    }, [addFavorite, disclaimerAccepted, favorites, removeFavorite]);

    const acceptDisclaimer = useCallback(() => {
        setDisclaimerAccepted(true);
        writeDisclaimerAccepted(true);
        setIsDisclaimerOpen(false);
        if (pendingFavorite) {
            addFavorite(pendingFavorite);
            setPendingFavorite(null);
        }
    }, [addFavorite, pendingFavorite]);

    const closeDisclaimer = useCallback(() => {
        setIsDisclaimerOpen(false);
        setPendingFavorite(null);
    }, []);

    const isFavorite = useCallback((petID: number) => {
        return favorites.some((f) => f.ID === petID);
    }, [favorites]);

    const replaceFavorites = useCallback((nextFavorites: FavoriteItem[]) => {
        setFavorites(() => saveFavorites(nextFavorites));
    }, []);

    const setDisclaimerAcceptance = useCallback((next: boolean) => {
        setDisclaimerAccepted(next);
        writeDisclaimerAccepted(next);
    }, []);

    // Availability Check
    // We only check against the current list of pets.
    // If a favorite matches the species of the current view and is no longer present, remove it.
    const checkAvailability = useCallback((currentPets: AdoptableSearch[], currentSpecies: string) => {
        if (!currentPets || currentPets.length === 0) return;

        setFavorites(prev => {
            const newFavs = prev.filter(fav => {
                if (fav.Species === currentSpecies) {
                    const stillExists = currentPets.some((p) => p.ID === fav.ID);
                    return stillExists;
                }

                return true;
            });

            if (newFavs.length !== prev.length) {
                return saveFavorites(newFavs);
            }

            return prev;
        });
    }, []);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        isDisclaimerOpen,
        acceptDisclaimer,
        closeDisclaimer,
        checkAvailability,
        isDisclaimerAccepted: disclaimerAccepted,
        replaceFavorites,
        setDisclaimerAcceptance,
    };
};
