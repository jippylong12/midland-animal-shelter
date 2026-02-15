import { useCallback, useEffect, useState } from 'react';
import {
    AdoptionChecklist,
    AdoptionChecklistItemId,
    createEmptyAdoptionChecklist,
    MAX_ADOPTION_NOTES_CHARACTERS,
    readAdoptionChecklistStore,
    writeAdoptionChecklistStore,
} from '../utils/adoptionChecklist';

export const useAdoptionChecklist = () => {
    const [checklists, setChecklists] = useState<Record<number, AdoptionChecklist>>(() => readAdoptionChecklistStore());

    useEffect(() => {
        writeAdoptionChecklistStore(checklists);
    }, [checklists]);

    const getChecklistForPet = useCallback((petID: number): AdoptionChecklist => {
        return checklists[petID] ?? createEmptyAdoptionChecklist();
    }, [checklists]);

    const setChecklistItem = useCallback((petID: number, itemId: AdoptionChecklistItemId, isChecked: boolean) => {
        setChecklists((prev) => {
            const current = prev[petID] ?? createEmptyAdoptionChecklist();
            if (current.items[itemId] === isChecked) {
                return prev;
            }

            return {
                ...prev,
                [petID]: {
                    ...current,
                    items: {
                        ...current.items,
                        [itemId]: isChecked,
                    },
                },
            };
        });
    }, []);

    const setChecklistNotes = useCallback((petID: number, notes: string) => {
        const normalizedNotes = notes.slice(0, MAX_ADOPTION_NOTES_CHARACTERS);
        setChecklists((prev) => {
            const current = prev[petID] ?? createEmptyAdoptionChecklist();
            if (current.notes === normalizedNotes) {
                return prev;
            }

            return {
                ...prev,
                [petID]: {
                    ...current,
                    notes: normalizedNotes,
                },
            };
        });
    }, []);

    return {
        getChecklistForPet,
        setChecklistItem,
        setChecklistNotes,
    };
};
