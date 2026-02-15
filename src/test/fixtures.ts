import { AdoptableDetails, AdoptableSearch } from '../types';

const escapeXml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const toXmlValue = (value: unknown) => {
    if (value === null || value === undefined) {
        return '';
    }
    return escapeXml(String(value));
};

const objectToXmlTags = (record: Record<string, unknown>) =>
    Object.entries(record)
        .map(([key, value]) => `<${key}>${toXmlValue(value)}</${key}>`)
        .join('');

export const createPet = (overrides: Partial<AdoptableSearch> = {}): AdoptableSearch => ({
    ID: 1,
    Name: 'Rex',
    Species: 'Dog',
    Sex: 'Male',
    PrimaryBreed: 'Labrador Retriever',
    SecondaryBreed: '',
    SN: '',
    Age: 24,
    Photo: 'https://example.com/rex.jpg',
    Location: 'Main Shelter',
    OnHold: 'No',
    SpecialNeeds: '',
    NoDogs: 'No',
    NoCats: 'No',
    NoKids: 'No',
    MemoList: '',
    ARN: '',
    BehaviorTestList: '',
    Stage: 'Available',
    AnimalType: 1,
    AgeGroup: 'Adult',
    WildlifeIntakeInjury: '',
    WildlifeIntakeCause: '',
    BuddyID: 0,
    Featured: 'No',
    Sublocation: '',
    ChipNumber: '',
    ...overrides,
});

export const createPetDetails = (overrides: Partial<AdoptableDetails> = {}): AdoptableDetails => ({
    CompanyID: 1,
    ID: 1,
    AnimalName: 'Rex',
    Species: 'Dog',
    Sex: 'Male',
    Altered: 'Yes',
    PrimaryBreed: 'Labrador Retriever',
    SecondaryBreed: null,
    PrimaryColor: 'Brown',
    SecondaryColor: null,
    Age: 24,
    Size: 'Large',
    Housetrained: 'Unknown',
    Declawed: 'No',
    Price: '0',
    LastIntakeDate: '2024-01-01',
    Location: 'Main Shelter',
    Dsc: 'Friendly and playful.',
    Photo1: 'https://example.com/rex-1.jpg',
    Photo2: null,
    Photo3: null,
    OnHold: 'No',
    SpecialNeeds: null,
    NoDogs: null,
    NoCats: null,
    NoKids: null,
    BehaviorResult: null,
    MemoList: '',
    Site: '',
    DateOfSurrender: '2024-01-01',
    TimeInFormerHome: '',
    ReasonForSurrender: 'Owner moved',
    PrevEnvironment: null,
    LivedWithChildren: 'Yes',
    LivedWithAnimals: 'Yes',
    LivedWithAnimalTypes: 'Dogs',
    BodyWeight: '65',
    DateOfBirth: '2022-01-01',
    ARN: null,
    VideoID: null,
    BehaviorTestList: '',
    Stage: 'Available',
    AnimalType: 'Dog',
    AgeGroup: 'Adult',
    WildlifeIntakeInjury: null,
    WildlifeIntakeCause: null,
    BuddyID: '',
    Featured: 'No',
    Sublocation: '',
    ChipNumber: '',
    ColorPattern: null,
    AdoptionApplicationUrl: 'https://example.com/adopt/rex',
    BannerURL: '',
    ...overrides,
});

export const buildSearchXml = (pets: AdoptableSearch[]) =>
    `<ArrayOfXmlNode>${pets
        .map((pet) => `<XmlNode><adoptableSearch>${objectToXmlTags(pet as unknown as Record<string, unknown>)}</adoptableSearch></XmlNode>`)
        .join('')}</ArrayOfXmlNode>`;

export const buildDetailsXml = (details: AdoptableDetails) =>
    `<adoptableDetails>${objectToXmlTags(details as Record<string, unknown>)}</adoptableDetails>`;
