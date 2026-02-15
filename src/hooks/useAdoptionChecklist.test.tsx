import { act, renderHook } from '@testing-library/react';
import { ADOPTION_CHECKLIST_STORAGE_KEY } from '../utils/adoptionChecklist';
import { useAdoptionChecklist } from './useAdoptionChecklist';

describe('useAdoptionChecklist', () => {
    it('returns empty defaults for malformed stored payloads', () => {
        localStorage.setItem(ADOPTION_CHECKLIST_STORAGE_KEY, 'not-json');

        const { result } = renderHook(() => useAdoptionChecklist());

        expect(result.current.getChecklistForPet(77)).toMatchObject({
            items: {
                good_with_children: false,
                good_with_other_pets: false,
                energy_level_fit: false,
            },
            notes: '',
        });
    });

    it('persists checklist and notes updates by pet ID', () => {
        const { result } = renderHook(() => useAdoptionChecklist());

        act(() => {
            result.current.setChecklistItem(77, 'good_with_children', true);
            result.current.setChecklistNotes(77, 'Need a fenced yard and daily walks');
        });

        const storedRaw = localStorage.getItem(ADOPTION_CHECKLIST_STORAGE_KEY);
        expect(storedRaw).not.toBeNull();

        const stored = storedRaw ? JSON.parse(storedRaw) : {};
        expect(stored[77].items).toEqual({
            good_with_children: true,
            good_with_other_pets: false,
            energy_level_fit: false,
        });
        expect(stored[77].notes).toBe('Need a fenced yard and daily walks');
        expect(result.current.getChecklistForPet(77).items.good_with_other_pets).toBe(false);
        expect(result.current.getChecklistForPet(77).notes).toBe('Need a fenced yard and daily walks');
    });
});
