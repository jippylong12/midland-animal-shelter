import { describe, expect } from 'vitest';
import { createPet } from '../test/fixtures';
import {
    clearSpeciesNewMatchHistory,
    computeNewMatches,
    getPetMatchKey,
    getSpeciesMatchKey,
    NewMatchStorage,
} from './newMatchTracker';

describe('newMatchTracker', () => {
    it('computes new matches only for species with prior snapshots', () => {
        const now = 1000;
        const store: NewMatchStorage = {
            dog: { ids: ['101'], updatedAt: 500 },
        };
        const pets = [
            createPet({ ID: 101, Species: 'Dog', Name: 'Spot' }),
            createPet({ ID: 102, Species: 'Dog', Name: 'Buddy' }),
            createPet({ ID: 201, Species: 'Cat', Name: 'Mittens' }),
        ];

        const { newMatchIds, nextStore } = computeNewMatches(pets, store, now);

        expect(Array.from(newMatchIds).sort()).toEqual(['dog|102']);
        expect(nextStore).toEqual<NewMatchStorage>({
            dog: { ids: ['101', '102'], updatedAt: now },
            cat: { ids: ['201'], updatedAt: now },
        });
    });

    it('clears species history by capturing current ids as baseline', () => {
        const store: NewMatchStorage = {
            dog: { ids: ['101', '102'], updatedAt: 500 },
            cat: { ids: ['201'], updatedAt: 500 },
        };
        const pets = [
            createPet({ ID: 101, Species: 'Dog', Name: 'Spot' }),
            createPet({ ID: 102, Species: 'Dog', Name: 'Buddy' }),
            createPet({ ID: 301, Species: 'Cat', Name: 'Nix' }),
        ];

        const cleared = clearSpeciesNewMatchHistory(store, ['dog'], pets, 900);

        expect(cleared).toEqual<NewMatchStorage>({
            dog: { ids: ['101', '102'], updatedAt: 900 },
            cat: { ids: ['201'], updatedAt: 500 },
        });
    });

    it('normalizes species and id inputs for match keys', () => {
        expect(getSpeciesMatchKey('  Dog ')).toBe('dog');
        expect(getPetMatchKey({ Species: '  Dog ', ID: 42 })).toBe('dog|42');
    });
});
