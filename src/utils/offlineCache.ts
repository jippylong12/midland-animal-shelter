import { AdoptableDetails, AdoptableSearch } from '../types';

export const PET_LIST_CACHE_KEY = 'shelter_offline_pet_list_cache';
export const PET_DETAILS_CACHE_KEY = 'shelter_offline_pet_details_cache';

type UnknownObject = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownObject =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const parseString = (value: unknown): string => (typeof value === 'string' ? value : '');

const parseNullableString = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    return null;
};

const parseNumber = (value: unknown, fallback = 0): number => {
    const parsed = typeof value === 'number'
        ? value
        : Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseNumberOrString = (value: unknown): number | string => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') return value;
    return '';
};

const EMPTY_ADOPTABLE_SEARCH: AdoptableSearch = {
    ID: 0,
    Name: '',
    Species: '',
    Sex: '',
    PrimaryBreed: '',
    SecondaryBreed: '',
    SN: '',
    Age: 0,
    Photo: '',
    Location: '',
    OnHold: '',
    SpecialNeeds: '',
    NoDogs: '',
    NoCats: '',
    NoKids: '',
    MemoList: '',
    ARN: '',
    BehaviorTestList: '',
    Stage: '',
    AnimalType: '',
    AgeGroup: '',
    WildlifeIntakeInjury: '',
    WildlifeIntakeCause: '',
    BuddyID: 0,
    Featured: '',
    Sublocation: '',
    ChipNumber: '',
};

const EMPTY_ADOPTABLE_DETAILS: AdoptableDetails = {
    CompanyID: 0,
    ID: 0,
    AnimalName: '',
    Species: '',
    Sex: '',
    Altered: '',
    PrimaryBreed: '',
    SecondaryBreed: null,
    PrimaryColor: '',
    SecondaryColor: null,
    Age: 0,
    Size: '',
    Housetrained: '',
    Declawed: '',
    Price: '0',
    LastIntakeDate: '',
    Location: '',
    Dsc: null,
    Photo1: '',
    Photo2: null,
    Photo3: null,
    OnHold: '',
    SpecialNeeds: null,
    NoDogs: null,
    NoCats: null,
    NoKids: null,
    BehaviorResult: null,
    MemoList: '',
    Site: '',
    DateOfSurrender: '',
    TimeInFormerHome: '',
    ReasonForSurrender: '',
    PrevEnvironment: null,
    LivedWithChildren: '',
    LivedWithAnimals: '',
    LivedWithAnimalTypes: null,
    BodyWeight: '',
    DateOfBirth: '',
    ARN: null,
    VideoID: null,
    BehaviorTestList: '',
    Stage: '',
    AnimalType: '',
    AgeGroup: '',
    WildlifeIntakeInjury: null,
    WildlifeIntakeCause: null,
    BuddyID: '',
    Featured: '',
    Sublocation: '',
    ChipNumber: '',
    ColorPattern: null,
    AdoptionApplicationUrl: '',
    BannerURL: '',
};

export interface CachedPetList {
    timestamp: number;
    speciesId: number;
    pets: AdoptableSearch[];
}

export interface CachedPetDetails {
    timestamp: number;
    details: AdoptableDetails;
}

type PetListCacheStore = Record<string, CachedPetList>;
type PetDetailsCacheStore = Record<string, CachedPetDetails>;

const readPetListCacheStore = (): PetListCacheStore => {
    try {
        const raw = localStorage.getItem(PET_LIST_CACHE_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) return {};

        const next: PetListCacheStore = {};

        Object.entries(parsed).forEach(([rawTab, entry]) => {
            if (!/^\d+$/.test(rawTab)) return;
            if (!isRecord(entry)) return;

            const timestamp = parseNumber(entry.timestamp);
            const speciesId = parseNumber(entry.speciesId);
            const petsRaw = Array.isArray(entry.pets) ? entry.pets : [];

            if (timestamp <= 0 || speciesId < 0) {
                return;
            }

            const pets = petsRaw
                .map((pet) => normalizeCachedPet(pet))
                .filter((pet): pet is AdoptableSearch => pet !== null);

            next[rawTab] = {
                timestamp,
                speciesId,
                pets,
            };
        });

        return next;
    } catch {
        return {};
    }
};

const writePetListCacheStore = (store: PetListCacheStore) => {
    try {
        localStorage.setItem(PET_LIST_CACHE_KEY, JSON.stringify(store));
    } catch {
        // Keep UI behavior resilient if storage is unavailable or full.
    }
};

const readPetDetailsCacheStore = (): PetDetailsCacheStore => {
    try {
        const raw = localStorage.getItem(PET_DETAILS_CACHE_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) return {};

        const next: PetDetailsCacheStore = {};

        Object.entries(parsed).forEach(([rawID, entry]) => {
            if (!/^\d+$/.test(rawID)) return;
            if (!isRecord(entry)) return;

            const id = parseInt(rawID, 10);
            const timestamp = parseNumber(entry.timestamp);
            const details = normalizeCachedPetDetails(entry.details);

            if (timestamp <= 0 || !details || id !== details.ID) return;

            next[rawID] = {
                timestamp,
                details,
            };
        });

        return next;
    } catch {
        return {};
    }
};

const writePetDetailsCacheStore = (store: PetDetailsCacheStore) => {
    try {
        localStorage.setItem(PET_DETAILS_CACHE_KEY, JSON.stringify(store));
    } catch {
        // Keep UI behavior resilient if storage is unavailable or full.
    }
};

const normalizeCachedPet = (value: unknown): AdoptableSearch | null => {
    if (!isRecord(value)) return null;
    const id = parseNumber(value.ID, Number.NaN);
    if (!Number.isInteger(id) || id < 0) return null;

    return {
        ...EMPTY_ADOPTABLE_SEARCH,
        ID: id,
        Name: parseString(value.Name),
        Species: parseString(value.Species),
        Sex: parseString(value.Sex),
        PrimaryBreed: parseString(value.PrimaryBreed),
        SecondaryBreed: parseString(value.SecondaryBreed),
        SN: parseString(value.SN),
        Age: parseNumber(value.Age),
        Photo: parseString(value.Photo),
        Location: parseString(value.Location),
        OnHold: parseString(value.OnHold),
        SpecialNeeds: parseString(value.SpecialNeeds),
        NoDogs: parseString(value.NoDogs),
        NoCats: parseString(value.NoCats),
        NoKids: parseString(value.NoKids),
        MemoList: parseString(value.MemoList),
        ARN: parseString(value.ARN),
        BehaviorTestList: parseString(value.BehaviorTestList),
        Stage: parseString(value.Stage),
        AnimalType: parseNumberOrString(value.AnimalType),
        AgeGroup: parseString(value.AgeGroup),
        WildlifeIntakeInjury: parseString(value.WildlifeIntakeInjury),
        WildlifeIntakeCause: parseString(value.WildlifeIntakeCause),
        BuddyID: parseNumber(value.BuddyID),
        Featured: parseString(value.Featured),
        Sublocation: parseString(value.Sublocation),
        ChipNumber: parseNumberOrString(value.ChipNumber),
    };
};

const normalizeCachedPetDetails = (value: unknown): AdoptableDetails | null => {
    if (!isRecord(value)) return null;
    const id = parseNumber(value.ID, Number.NaN);
    if (!Number.isInteger(id) || id < 0) return null;

    return {
        ...EMPTY_ADOPTABLE_DETAILS,
        CompanyID: parseNumber(value.CompanyID),
        ID: id,
        AnimalName: parseString(value.AnimalName),
        Species: parseString(value.Species),
        Sex: parseString(value.Sex),
        Altered: parseString(value.Altered),
        PrimaryBreed: parseString(value.PrimaryBreed),
        SecondaryBreed: parseNullableString(value.SecondaryBreed),
        PrimaryColor: parseString(value.PrimaryColor),
        SecondaryColor: parseNullableString(value.SecondaryColor),
        Age: parseNumber(value.Age),
        Size: parseString(value.Size),
        Housetrained: parseString(value.Housetrained),
        Declawed: parseString(value.Declawed),
        Price: parseString(value.Price),
        LastIntakeDate: parseString(value.LastIntakeDate),
        Location: parseString(value.Location),
        Dsc: parseNullableString(value.Dsc),
        Photo1: parseString(value.Photo1),
        Photo2: parseNullableString(value.Photo2),
        Photo3: parseNullableString(value.Photo3),
        OnHold: parseString(value.OnHold),
        SpecialNeeds: parseNullableString(value.SpecialNeeds),
        NoDogs: parseNullableString(value.NoDogs),
        NoCats: parseNullableString(value.NoCats),
        NoKids: parseNullableString(value.NoKids),
        BehaviorResult: parseNullableString(value.BehaviorResult),
        MemoList: parseNullableString(value.MemoList) ?? '',
        Site: parseString(value.Site),
        DateOfSurrender: parseString(value.DateOfSurrender),
        TimeInFormerHome: parseString(value.TimeInFormerHome),
        ReasonForSurrender: parseString(value.ReasonForSurrender),
        PrevEnvironment: parseNullableString(value.PrevEnvironment),
        LivedWithChildren: parseString(value.LivedWithChildren),
        LivedWithAnimals: parseString(value.LivedWithAnimals),
        LivedWithAnimalTypes: parseNullableString(value.LivedWithAnimalTypes),
        BodyWeight: parseString(value.BodyWeight),
        DateOfBirth: parseString(value.DateOfBirth),
        ARN: parseNullableString(value.ARN),
        VideoID: parseNullableString(value.VideoID),
        BehaviorTestList: parseNullableString(value.BehaviorTestList) ?? '',
        Stage: parseString(value.Stage),
        AnimalType: parseString(value.AnimalType),
        AgeGroup: parseString(value.AgeGroup),
        WildlifeIntakeInjury: parseNullableString(value.WildlifeIntakeInjury),
        WildlifeIntakeCause: parseNullableString(value.WildlifeIntakeCause),
        BuddyID: parseString(value.BuddyID),
        Featured: parseString(value.Featured),
        Sublocation: parseString(value.Sublocation),
        ChipNumber: parseString(value.ChipNumber),
        ColorPattern: parseNullableString(value.ColorPattern),
        AdoptionApplicationUrl: parseString(value.AdoptionApplicationUrl),
        BannerURL: parseString(value.BannerURL),
    };
};

export const readCachedPetList = (tabIndex: number): CachedPetList | null => {
    const store = readPetListCacheStore();
    return store[String(tabIndex)] ?? null;
};

export const writeCachedPetList = (tabIndex: number, speciesId: number, pets: AdoptableSearch[]): CachedPetList | null => {
    const now = Date.now();
    const normalizedPets = pets.map(normalizeCachedPet).filter((pet): pet is AdoptableSearch => pet !== null);
    const store = readPetListCacheStore();
    const normalizedSpeciesId = parseNumber(speciesId, 0);

    if (normalizedSpeciesId < 0) return null;

    const entry: CachedPetList = {
        timestamp: now,
        speciesId: normalizedSpeciesId,
        pets: normalizedPets,
    };

    store[String(tabIndex)] = entry;
    writePetListCacheStore(store);

    return entry;
};

export const readCachedPetDetails = (petId: number): CachedPetDetails | null => {
    const store = readPetDetailsCacheStore();
    return store[String(petId)] ?? null;
};

export const writeCachedPetDetails = (details: AdoptableDetails): CachedPetDetails | null => {
    const now = Date.now();
    const normalizedDetails = normalizeCachedPetDetails(details);
    if (!normalizedDetails) return null;

    const store = readPetDetailsCacheStore();
    const entry: CachedPetDetails = {
        timestamp: now,
        details: normalizedDetails,
    };

    store[String(normalizedDetails.ID)] = entry;
    writePetDetailsCacheStore(store);

    return entry;
};
