import { useState, useEffect, useCallback } from 'react';
import { AdoptableSearch } from '../types';

const STORAGE_KEY = 'shelter_favorites';
const DISCLAIMER_KEY = 'shelter_favorites_disclaimer';
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface FavoriteItem extends AdoptableSearch {
    savedAt: number;
}

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
    const [pendingFavorite, setPendingFavorite] = useState<AdoptableSearch | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedDisclaimer = localStorage.getItem(DISCLAIMER_KEY);
            if (storedDisclaimer === 'true') {
                setDisclaimerAccepted(true);
            }

            const storedFavorites = localStorage.getItem(STORAGE_KEY);
            if (storedFavorites) {
                const parsed: FavoriteItem[] = JSON.parse(storedFavorites);
                const now = Date.now();

                // Filter out expired items and renew valid ones
                const validFavorites = parsed.filter(item => {
                    return (now - item.savedAt) < EXPIRATION_MS;
                }).map(item => ({
                    ...item,
                    savedAt: now // Renew timestamp
                }));

                setFavorites(validFavorites);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(validFavorites));
            }
        } catch (e) {
            console.error('LocalStorage not supported or error parsing', e);
        }
    }, []);

    const saveFavorites = (newFavorites: FavoriteItem[]) => {
        setFavorites(newFavorites);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    };

    const addFavorite = useCallback((pet: AdoptableSearch) => {
        setFavorites(prev => {
            if (prev.some(f => f.ID === pet.ID)) return prev;
            const newFavs = [...prev, { ...pet, savedAt: Date.now() }];
            saveFavorites(newFavs);
            return newFavs;
        });
    }, []);

    const removeFavorite = useCallback((petID: number) => {
        setFavorites(prev => {
            const newFavs = prev.filter(f => f.ID !== petID);
            saveFavorites(newFavs);
            return newFavs;
        });
    }, []);

    const toggleFavorite = useCallback((pet: AdoptableSearch) => {
        const isFav = favorites.some(f => f.ID === pet.ID);
        if (isFav) {
            removeFavorite(pet.ID);
        } else {
            if (!disclaimerAccepted) {
                setPendingFavorite(pet);
                setIsDisclaimerOpen(true);
            } else {
                addFavorite(pet);
            }
        }
    }, [favorites, disclaimerAccepted, addFavorite, removeFavorite]);

    const acceptDisclaimer = useCallback(() => {
        setDisclaimerAccepted(true);
        setIsDisclaimerOpen(false);
        try {
            localStorage.setItem(DISCLAIMER_KEY, 'true');
        } catch (e) {
            console.error('Error saving disclaimer status', e);
        }
        if (pendingFavorite) {
            addFavorite(pendingFavorite);
            setPendingFavorite(null);
        }
    }, [pendingFavorite, addFavorite]);

    const closeDisclaimer = useCallback(() => {
        setIsDisclaimerOpen(false);
        setPendingFavorite(null);
    }, []);

    const isFavorite = useCallback((petID: number) => {
        return favorites.some(f => f.ID === petID);
    }, [favorites]);

    // Availability Check
    // We only check against the current list of pets. 
    // If a favorite matches the species of the current list but is NOT in the list, it's removed.
    const checkAvailability = useCallback((currentPets: AdoptableSearch[], currentSpecies: string) => {
        if (!currentPets || currentPets.length === 0) return;

        setFavorites(prev => {
            const newFavs = prev.filter(fav => {
                // If the favorite is of the same species as the current view
                // AND it is NOT in the current list, assume it's gone.
                // Note: This assumes 'currentPets' is the COMPLETE list for that species, not just a page.
                // App.tsx fetches all pets for a species, then paginates locally. So this is safe.
                if (fav.Species === currentSpecies || (currentSpecies === 'All Pets' && true)) { // 'All Pets' might be tricky if not all are fetched
                    // Wait, App.tsx fetches by speciesID. 
                    // If currentSpecies is 'Dog', we check if fav (Dog) is in currentPets.
                    if (fav.Species === currentSpecies) {
                        const stillExists = currentPets.some(p => p.ID === fav.ID);
                        return stillExists;
                    }
                }
                return true; // Keep others
            });

            if (newFavs.length !== prev.length) {
                saveFavorites(newFavs);
                return newFavs;
            }
            return prev; // Return previous state if no changes to avoid re-render
        });
    }, []);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        isDisclaimerOpen,
        acceptDisclaimer,
        closeDisclaimer,
        checkAvailability
    };
};
