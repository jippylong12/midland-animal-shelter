export const ADOPTION_CHECKLIST_STORAGE_KEY = 'shelter_adoption_checklists';

export interface ChecklistItem {
    id: string;
    label: string;
}

export const ADOPTION_CHECKLIST_ITEMS: ChecklistItem[] = [
    { id: 'good_with_children', label: 'Good with children' },
    { id: 'good_with_other_pets', label: 'Good with other pets in the household' },
    { id: 'energy_level_fit', label: 'Energy level fits your routine' },
];

type AdoptionChecklistItemId = typeof ADOPTION_CHECKLIST_ITEMS[number]['id'];
export type { AdoptionChecklistItemId };

export interface AdoptionChecklist {
    items: Record<AdoptionChecklistItemId, boolean>;
    notes: string;
}

export const MAX_ADOPTION_NOTES_CHARACTERS = 1000;

const CHECKLIST_ITEM_IDS = new Set(ADOPTION_CHECKLIST_ITEMS.map((item) => item.id));

const createEmptyItems = (): Record<AdoptionChecklistItemId, boolean> =>
    ADOPTION_CHECKLIST_ITEMS.reduce((acc, item) => {
        acc[item.id as AdoptionChecklistItemId] = false;
        return acc;
    }, {} as Record<AdoptionChecklistItemId, boolean>);

const isKnownChecklistItem = (value: string): value is AdoptionChecklistItemId =>
    CHECKLIST_ITEM_IDS.has(value);

export const createEmptyAdoptionChecklist = (): AdoptionChecklist => ({
    items: createEmptyItems(),
    notes: '',
});

const normalizeChecklistItems = (value: unknown): Record<AdoptionChecklistItemId, boolean> => {
    const normalized = createEmptyItems();

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return normalized;
    }

    Object.entries(value as Record<string, unknown>).forEach(([itemId, rawChecked]) => {
        if (!isKnownChecklistItem(itemId)) {
            return;
        }
        if (typeof rawChecked === 'boolean') {
            normalized[itemId] = rawChecked;
        }
    });

    return normalized;
};

const normalizeNotes = (value: unknown): string =>
    typeof value === 'string' ? value.slice(0, MAX_ADOPTION_NOTES_CHARACTERS) : '';

const normalizeChecklist = (value: unknown): AdoptionChecklist => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return createEmptyAdoptionChecklist();
    }

    const raw = value as { items?: unknown; notes?: unknown };

    return {
        items: normalizeChecklistItems(raw.items),
        notes: normalizeNotes(raw.notes),
    };
};

export const normalizeAdoptionChecklistStore = (value: unknown): Record<number, AdoptionChecklist> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    const raw = value as Record<string, unknown>;
    const normalized: Record<number, AdoptionChecklist> = {};

    Object.entries(raw).forEach(([petId, petChecklist]) => {
        const normalizedId = Number(petId);
        if (!Number.isInteger(normalizedId) || normalizedId < 0) {
            return;
        }
        normalized[normalizedId] = normalizeChecklist(petChecklist);
    });

    return normalized;
};

export const readAdoptionChecklistStore = (): Record<number, AdoptionChecklist> => {
    try {
        const raw = localStorage.getItem(ADOPTION_CHECKLIST_STORAGE_KEY);
        if (!raw) {
            return {};
        }
        return normalizeAdoptionChecklistStore(JSON.parse(raw));
    } catch {
        return {};
    }
};

export const writeAdoptionChecklistStore = (state: Record<number, AdoptionChecklist>) => {
    try {
        localStorage.setItem(ADOPTION_CHECKLIST_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Keep app behavior resilient if storage is unavailable.
    }
};

