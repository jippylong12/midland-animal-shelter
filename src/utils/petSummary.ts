import { AdoptableDetails } from '../types';

const toTextValue = (value: string | number | null | undefined): string | null => {
    if (value === null || value === undefined) return null;

    const text = String(value).trim();
    return text.length > 0 ? text : null;
};

export const formatPetAgeForSummary = (ageInMonths: number): string => {
    if (ageInMonths < 12) {
        return `${ageInMonths} Month${ageInMonths === 1 ? '' : 's'}`;
    }

    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    return `${years} Year${years === 1 ? '' : 's'}${months > 0 ? ` and ${months} Month${months === 1 ? '' : 's'}` : ''}`;
};

const buildSummaryLine = (label: string, value: string | number | null | undefined) => {
    const summaryValue = toTextValue(value);
    return summaryValue ? `${label}: ${summaryValue}` : null;
};

export const buildPetSummaryText = (details: AdoptableDetails): string => {
    const breed = toTextValue(details.SecondaryBreed)
        ? `${toTextValue(details.PrimaryBreed) ?? 'Unknown'} (${toTextValue(details.SecondaryBreed)!})`
        : toTextValue(details.PrimaryBreed) ?? 'Unknown';

    const lines = [
        buildSummaryLine('Pet Name', details.AnimalName),
        buildSummaryLine('Species', details.Species),
        `Breed: ${breed}`,
        buildSummaryLine('Age', formatPetAgeForSummary(details.Age)),
        buildSummaryLine('Sex', details.Sex),
        buildSummaryLine('Stage', details.Stage),
        buildSummaryLine('Location', details.Location),
        buildSummaryLine('Special Needs', details.SpecialNeeds),
        buildSummaryLine('Behavior', details.BehaviorResult),
        buildSummaryLine('Reason for Surrender', details.ReasonForSurrender),
        buildSummaryLine('Adoption Link', details.AdoptionApplicationUrl),
    ];

    return lines.filter((line): line is string => Boolean(line)).join('\n');
};
