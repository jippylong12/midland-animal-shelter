import { renderHook, act, waitFor } from '@testing-library/react';
import { useSeenPets } from './useSeenPets';
import { createPet } from '../test/fixtures';

const SEEN_KEY = 'seenPets';
const SEEN_ENABLED_KEY = 'seenPetsEnabled';

describe('useSeenPets', () => {
    it('toggles seen tracking and persists the enabled state', async () => {
        const { result } = renderHook(() => useSeenPets());

        expect(result.current.isSeenEnabled).toBe(false);

        act(() => {
            result.current.toggleSeenFeature();
        });

        expect(result.current.isSeenEnabled).toBe(true);
        await waitFor(() => {
            expect(localStorage.getItem(SEEN_ENABLED_KEY)).toBe('true');
        });
    });

    it('marks pets as seen and avoids duplicates', () => {
        const dog = createPet({ ID: 401, Species: 'Dog' });
        const cat = createPet({ ID: 402, Species: 'Cat' });
        const { result } = renderHook(() => useSeenPets());

        act(() => {
            result.current.toggleSeenFeature();
        });

        act(() => {
            result.current.markAsSeen(dog);
            result.current.markAsSeen(dog);
            result.current.markAllAsSeen([dog, cat]);
        });

        expect(result.current.seenPets).toHaveLength(2);
        expect(result.current.isSeen(dog)).toBe(true);
        expect(result.current.isSeen(cat)).toBe(true);
    });

    it('loads only non-expired seen entries from storage', async () => {
        const now = Date.now();

        const fresh = { id: 500, species: 'Dog', timestamp: now - (5 * 24 * 60 * 60 * 1000) };
        const stale = { id: 501, species: 'Dog', timestamp: now - (31 * 24 * 60 * 60 * 1000) };
        localStorage.setItem(SEEN_KEY, JSON.stringify([fresh, stale]));
        localStorage.setItem(SEEN_ENABLED_KEY, JSON.stringify(true));

        const { result } = renderHook(() => useSeenPets());

        await waitFor(() => {
            expect(result.current.seenPets).toHaveLength(1);
        });
        expect(result.current.seenPets[0].id).toBe(500);
        expect(result.current.isSeenEnabled).toBe(true);
    });
});
