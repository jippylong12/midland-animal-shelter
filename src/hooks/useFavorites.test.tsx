import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavorites } from './useFavorites';
import { createPet } from '../test/fixtures';

const FAVORITES_KEY = 'shelter_favorites';
const DISCLAIMER_KEY = 'shelter_favorites_disclaimer';

describe('useFavorites', () => {
    it('requires disclaimer acceptance before first favorite is saved', () => {
        const pet = createPet({ ID: 101, Name: 'Nala' });
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(pet);
        });

        expect(result.current.isDisclaimerOpen).toBe(true);
        expect(result.current.favorites).toHaveLength(0);

        act(() => {
            result.current.acceptDisclaimer();
        });

        expect(result.current.isDisclaimerOpen).toBe(false);
        expect(result.current.favorites).toHaveLength(1);
        expect(result.current.favorites[0].ID).toBe(101);
        expect(localStorage.getItem(DISCLAIMER_KEY)).toBe('true');
    });

    it('loads stored favorites, removes expired entries, and renews valid timestamps', async () => {
        const now = Date.now();

        const valid = { ...createPet({ ID: 1, Name: 'Valid' }), savedAt: now - (2 * 24 * 60 * 60 * 1000) };
        const expired = { ...createPet({ ID: 2, Name: 'Expired' }), savedAt: now - (8 * 24 * 60 * 60 * 1000) };
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([valid, expired]));

        const { result } = renderHook(() => useFavorites());

        await waitFor(() => {
            expect(result.current.favorites).toHaveLength(1);
        });
        expect(result.current.favorites[0].ID).toBe(1);
        expect(result.current.favorites[0].savedAt).toBeGreaterThanOrEqual(now);
    });

    it('removes unavailable favorites for the currently viewed species', () => {
        localStorage.setItem(DISCLAIMER_KEY, 'true');
        const dog = createPet({ ID: 301, Name: 'Rufus', Species: 'Dog' });
        const cat = createPet({ ID: 302, Name: 'Milo', Species: 'Cat' });
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(dog);
            result.current.toggleFavorite(cat);
        });
        expect(result.current.favorites).toHaveLength(2);

        act(() => {
            result.current.checkAvailability([createPet({ ID: 999, Species: 'Dog' })], 'Dog');
        });

        expect(result.current.favorites).toHaveLength(1);
        expect(result.current.favorites[0].Species).toBe('Cat');
    });
});
