import { AdoptableSearch } from '../types';

export interface PersonalFitPreferences {
    agePreference: number;
    stagePriority: number;
    specialNeedsPriority: number;
}

export const PERSONAL_FIT_PREFERENCES_KEY = 'shelter_personal_fit_preferences';
export const PERSONAL_FIT_ENABLED_KEY = 'shelter_personal_fit_enabled';
export const DEFAULT_PERSONAL_FIT_PREFERENCES: PersonalFitPreferences = {
    agePreference: 50,
    stagePriority: 70,
    specialNeedsPriority: 60,
};
export const DEFAULT_PERSONAL_FIT_ENABLED = false;

export interface PersonalFitScore {
    total: number;
    age: number;
    stage: number;
    specialNeeds: number;
    normalized: {
        age: number;
        stage: number;
        specialNeeds: number;
    };
}

type UnknownObject = Record<string, unknown>;

const normalizePercentage = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.min(100, Math.max(0, Math.round(value)));
};

const normalizePreference = (value: unknown, fallback: number): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return normalizePercentage(fallback);
    }
    return normalizePercentage(value);
};

const isPositiveText = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    const normalized = value.trim().toLowerCase();
    return normalized === 'yes' || normalized === 'true' || normalized === '1';
};

const inferHasSpecialNeeds = (pet: AdoptableSearch): boolean => {
    if (isPositiveText(pet.SpecialNeeds)) return true;
    const stageLower = pet.Stage.toLowerCase();
    return stageLower.includes('special need') || stageLower.includes('needs');
};

const getStageScore = (pet: AdoptableSearch): number => {
    const stageLower = pet.Stage.toLowerCase();
    if (stageLower.includes('available')) return 100;
    if (stageLower.includes('pending') || stageLower.includes('hold')) return 75;
    if (stageLower.includes('foster')) return 60;
    if (stageLower.includes('adopted')) return 0;
    return 50;
};

export const normalizePersonalFitPreferences = (value: unknown): PersonalFitPreferences => {
    const raw = (value as UnknownObject) ?? {};
    return {
        agePreference: normalizePreference(raw.agePreference, DEFAULT_PERSONAL_FIT_PREFERENCES.agePreference),
        stagePriority: normalizePreference(raw.stagePriority, DEFAULT_PERSONAL_FIT_PREFERENCES.stagePriority),
        specialNeedsPriority: normalizePreference(raw.specialNeedsPriority, DEFAULT_PERSONAL_FIT_PREFERENCES.specialNeedsPriority),
    };
};

export const readPersonalFitPreferences = (): PersonalFitPreferences => {
    try {
        const raw = localStorage.getItem(PERSONAL_FIT_PREFERENCES_KEY);
        if (!raw) return DEFAULT_PERSONAL_FIT_PREFERENCES;

        const parsed = JSON.parse(raw);
        return normalizePersonalFitPreferences(parsed);
    } catch {
        return DEFAULT_PERSONAL_FIT_PREFERENCES;
    }
};

export const writePersonalFitPreferences = (preferences: PersonalFitPreferences): void => {
    try {
        localStorage.setItem(PERSONAL_FIT_PREFERENCES_KEY, JSON.stringify(normalizePersonalFitPreferences(preferences)));
    } catch {
        // Keep client-only behavior resilient if storage fails.
    }
};

export const readPersonalFitEnabled = (): boolean => {
    try {
        const raw = localStorage.getItem(PERSONAL_FIT_ENABLED_KEY);
        if (raw === null) return DEFAULT_PERSONAL_FIT_ENABLED;
        return JSON.parse(raw) === true;
    } catch {
        return DEFAULT_PERSONAL_FIT_ENABLED;
    }
};

export const writePersonalFitEnabled = (enabled: boolean): void => {
    try {
        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, JSON.stringify(Boolean(enabled)));
    } catch {
        // Keep client-only behavior resilient if storage fails.
    }
};

export const buildPersonalFitScore = (pet: AdoptableSearch, preferences: PersonalFitPreferences): PersonalFitScore => {
    const normalizedAge = normalizePercentage(Math.min((pet.Age / 120) * 100, 100));

    const ageBias = preferences.agePreference - 50;
    const ageDirection = ageBias >= 0 ? (normalizedAge / 100) : (1 - normalizedAge / 100);
    const ageWeight = Math.abs(ageBias) / 50;
    const ageScore = 50 + (ageDirection * 100 - 50) * ageWeight;

    const stageBase = getStageScore(pet);
    const stageWeight = preferences.stagePriority / 100;
    const stageScore = 50 + (stageBase - 50) * stageWeight;

    const hasSpecialNeeds = inferHasSpecialNeeds(pet);
    const baseNeedsScore = hasSpecialNeeds ? 30 : 100;
    const specialNeedsWeight = preferences.specialNeedsPriority / 100;
    const specialNeedsScore = 50 + (baseNeedsScore - 50) * specialNeedsWeight;

    if (ageWeight === 0 && stageWeight === 0 && specialNeedsWeight === 0) {
        return {
            total: 50,
            age: 50,
            stage: 50,
            specialNeeds: 50,
            normalized: {
                age: ageWeight,
                stage: stageWeight,
                specialNeeds: specialNeedsWeight,
            },
        };
    }

    const totalWeight = ageWeight + stageWeight + specialNeedsWeight;
    const total = (
        ageScore * ageWeight
        + stageScore * stageWeight
        + specialNeedsScore * specialNeedsWeight
    ) / totalWeight;

    return {
        total: normalizePercentage(total),
        age: normalizePercentage(ageScore),
        stage: normalizePercentage(stageScore),
        specialNeeds: normalizePercentage(specialNeedsScore),
        normalized: {
            age: ageWeight,
            stage: stageWeight,
            specialNeeds: specialNeedsWeight,
        },
    };
};

export const getAgePreferenceLabel = (value: number): string => {
    if (value <= 24) {
        return 'Prefer younger pets';
    }
    if (value <= 49) {
        return 'Leaning younger pets';
    }
    if (value <= 51) {
        return 'Age-neutral';
    }
    if (value <= 75) {
        return 'Leaning older pets';
    }
    return 'Prefer older pets';
};

export const getStagePriorityLabel = (value: number): string => {
    if (value <= 15) {
        return 'Any stage';
    }
    if (value <= 45) {
        return 'Slightly prioritize immediate availability';
    }
    if (value <= 75) {
        return 'Prioritize active-stage pets';
    }
    return 'Strongly prioritize active-stage pets';
};

export const getSpecialNeedsPriorityLabel = (value: number): string => {
    if (value <= 15) {
        return 'Ignore special-needs differences';
    }
    if (value <= 45) {
        return 'Slightly prefer low-maintenance pets';
    }
    if (value <= 75) {
        return 'Prefer straightforward care needs';
    }
    return 'Prefer pets without special needs';
};
