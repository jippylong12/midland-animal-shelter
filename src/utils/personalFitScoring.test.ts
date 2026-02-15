import {
    buildPersonalFitScore,
    DEFAULT_PERSONAL_FIT_PREFERENCES,
    getAgePreferenceLabel,
    normalizePersonalFitPreferences,
    readPersonalFitEnabled,
    PERSONAL_FIT_PREFERENCES_KEY,
    PERSONAL_FIT_ENABLED_KEY,
    readPersonalFitPreferences,
    writePersonalFitEnabled,
    writePersonalFitPreferences,
} from './personalFitScoring';
import { createPet } from '../test/fixtures';

describe('personalFitScoring', () => {
    it('normalizes invalid preference payload values', () => {
        expect(normalizePersonalFitPreferences({
            agePreference: 'nope',
            stagePriority: 150,
            specialNeedsPriority: -20,
        })).toEqual({
            agePreference: 50,
            stagePriority: 100,
            specialNeedsPriority: 0,
        });
    });

    it('falls back to defaults on malformed storage payload', () => {
        localStorage.setItem(PERSONAL_FIT_PREFERENCES_KEY, 'not-json');

        expect(readPersonalFitPreferences()).toEqual(DEFAULT_PERSONAL_FIT_PREFERENCES);
    });

    it('falls back when personal fit enable flag is malformed', () => {
        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, 'not-json');

        expect(readPersonalFitEnabled()).toEqual(false);
    });

    it('persists normalized preferences and reads them back', () => {
        writePersonalFitPreferences({ agePreference: -5, stagePriority: 125, specialNeedsPriority: 80 });

        expect(readPersonalFitPreferences()).toEqual({
            agePreference: 0,
            stagePriority: 100,
            specialNeedsPriority: 80,
        });
    });

    it('persists and reads personal fit enable state', () => {
        writePersonalFitEnabled(true);

        expect(readPersonalFitEnabled()).toBe(true);
    });

    it('favours older pets when age preference is set toward older', () => {
        const olderPet = createPet({ ID: 1, Age: 180 });
        const youngerPet = createPet({ ID: 2, Age: 12 });
        const preferences = {
            agePreference: 90,
            stagePriority: 0,
            specialNeedsPriority: 0,
        };

        const olderScore = buildPersonalFitScore(olderPet, preferences).total;
        const youngerScore = buildPersonalFitScore(youngerPet, preferences).total;

        expect(olderScore).toBeGreaterThan(youngerScore);
    });

    it('returns a neutral score when all priority weights are zero', () => {
        const pet = createPet({ ID: 1, Age: 84, Stage: 'Available', SpecialNeeds: 'No' });
        const score = buildPersonalFitScore(pet, {
            agePreference: 50,
            stagePriority: 0,
            specialNeedsPriority: 0,
        });

        expect(score.total).toBe(50);
    });

    it('maps low age preferences to younger and high preferences to older labels', () => {
        expect(getAgePreferenceLabel(10)).toBe('Prefer younger pets');
        expect(getAgePreferenceLabel(50)).toBe('Age-neutral');
        expect(getAgePreferenceLabel(90)).toBe('Prefer older pets');
    });
});
