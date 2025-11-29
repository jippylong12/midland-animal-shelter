import { useState, useEffect, useCallback } from 'react';
import { AdoptableSearch } from '../types';

interface SeenPet {
    id: number;
    species: string;
    timestamp: number;
}

const STORAGE_KEY_SEEN_PETS = 'seenPets';
const STORAGE_KEY_SEEN_ENABLED = 'seenPetsEnabled';
const EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useSeenPets = () => {
    // Load from localStorage on mount (lazy initialization)
    const [isSeenEnabled, setIsSeenEnabled] = useState<boolean>(() => {
        const storedEnabled = localStorage.getItem(STORAGE_KEY_SEEN_ENABLED);
        return storedEnabled ? JSON.parse(storedEnabled) : false;
    });

    const [seenPets, setSeenPets] = useState<SeenPet[]>(() => {
        const storedSeenPets = localStorage.getItem(STORAGE_KEY_SEEN_PETS);
        if (storedSeenPets) {
            try {
                const parsed: SeenPet[] = JSON.parse(storedSeenPets);
                const now = Date.now();
                // Filter out expired items
                const validPets = parsed.filter(pet => now - pet.timestamp < EXPIRATION_MS);
                
                // Update storage if we filtered anything out (side effect in initializer is okay-ish, but better in effect)
                // We'll let the effect handle the update
                return validPets;
            } catch (e) {
                console.error("Failed to parse seen pets from localStorage", e);
                return [];
            }
        }
        return [];
    });

    // Persist changes to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_SEEN_ENABLED, JSON.stringify(isSeenEnabled));
    }, [isSeenEnabled]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_SEEN_PETS, JSON.stringify(seenPets));
    }, [seenPets]);

    const toggleSeenFeature = useCallback(() => {
        setIsSeenEnabled(prev => !prev);
    }, []);

    const markAsSeen = useCallback((pet: AdoptableSearch) => {
        if (!isSeenEnabled) return;

        setSeenPets(prev => {
            // Check if already seen
            if (prev.some(p => p.id === pet.ID && p.species === pet.Species)) {
                return prev;
            }
            return [...prev, { id: pet.ID, species: pet.Species, timestamp: Date.now() }];
        });
    }, [isSeenEnabled]);

    const markAllAsSeen = useCallback((pets: AdoptableSearch[]) => {
        if (!isSeenEnabled) return;

        setSeenPets(prev => {
            const newSeenPets = [...prev];
            const now = Date.now();
            let changed = false;

            pets.forEach(pet => {
                if (!prev.some(p => p.id === pet.ID && p.species === pet.Species)) {
                    newSeenPets.push({ id: pet.ID, species: pet.Species, timestamp: now });
                    changed = true;
                }
            });

            return changed ? newSeenPets : prev;
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
        isSeen
    };
};
