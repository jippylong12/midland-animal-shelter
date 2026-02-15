import { createPetDetails } from '../test/fixtures';
import { buildPetSummaryText, formatPetAgeForSummary } from './petSummary';

describe('petSummary', () => {
    it('builds a readable copy-ready summary from details', () => {
        const summary = buildPetSummaryText(createPetDetails({
            AnimalName: 'Ranger',
            Species: 'Dog',
            PrimaryBreed: 'Shepherd',
            SecondaryBreed: 'German',
            Age: 26,
            Sex: 'Male',
            Stage: 'Available',
            Location: 'Main Shelter',
            SpecialNeeds: 'House-trained',
            ReasonForSurrender: 'Family move',
            AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
        }));

        expect(summary).toContain('Pet Name: Ranger');
        expect(summary).toContain('Breed: Shepherd (German)');
        expect(summary).toContain('Age: 2 Years and 2 Months');
        expect(summary).toContain('Location: Main Shelter');
        expect(summary).toContain('Special Needs: House-trained');
        expect(summary).toContain('Reason for Surrender: Family move');
        expect(summary).toContain('Adoption Link: https://example.com/adopt/ranger');
    });

    it('formats month/age labels for sharing text consistently', () => {
        expect(formatPetAgeForSummary(1)).toBe('1 Month');
        expect(formatPetAgeForSummary(11)).toBe('11 Months');
        expect(formatPetAgeForSummary(12)).toBe('1 Year');
        expect(formatPetAgeForSummary(13)).toBe('1 Year and 1 Month');
        expect(formatPetAgeForSummary(25)).toBe('2 Years and 1 Month');
        expect(formatPetAgeForSummary(26)).toBe('2 Years and 2 Months');
    });
});
