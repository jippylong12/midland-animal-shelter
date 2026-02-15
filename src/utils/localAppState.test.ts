import { createPet } from '../test/fixtures';
import {
    buildLocalAppStateExport,
    parseLocalAppStateImport,
    LOCAL_APP_STATE_VERSION,
} from './localAppState';
import {
    createSearchPreset,
} from './searchPresets';

const buildLegacyPayload = () => ({
    favorites: [
        {
            ...createPet({ ID: 101, Name: 'Rex', Species: 'Dog' }),
            savedAt: Date.now() - (10_000),
        },
    ],
    seenPets: [
        {
            id: 101,
            species: 'Dog',
            timestamp: Date.now() - (10_000),
        },
    ],
    seenEnabled: true,
    favoritesDisclaimerAccepted: true,
    searchPresets: [createSearchPreset('Rex preset', 1, {
        searchQuery: 'rex',
        breed: ['Labrador'],
        gender: '',
        age: { min: '2', max: '9' },
        stage: '',
        sortBy: 'age',
        hideSeen: false,
    })],
    adoptionChecklists: {
        101: {
            items: {
                good_with_children: true,
                good_with_other_pets: false,
                energy_level_fit: false,
            },
            notes: 'Bring a leash',
        },
    },
});

describe('localAppState', () => {
    it('builds a valid schema payload and round-trips through the parser', () => {
        const payload = buildLegacyPayload();
        const localAppExport = buildLocalAppStateExport(payload);

        const parsed = parseLocalAppStateImport(JSON.stringify(localAppExport));

        expect(parsed.favorites).toHaveLength(1);
        expect(parsed.favorites[0]).toMatchObject({ ID: 101, Name: 'Rex' });
        expect(parsed.seenPets).toHaveLength(1);
        expect(parsed.seenPets[0]).toEqual({ id: 101, species: 'Dog', timestamp: expect.any(Number) });
        expect(parsed.searchPresets[0].name).toBe('Rex preset');
        expect(parsed.adoptionChecklists[101]).toEqual(payload.adoptionChecklists[101]);
        expect(parsed.compactCardView).toBe(false);
    });

    it('parses legacy payloads without schema metadata', () => {
        const legacyPayload = buildLegacyPayload();

        const parsed = parseLocalAppStateImport(JSON.stringify(legacyPayload));

        expect(parsed.favorites).toHaveLength(1);
        expect(parsed.seenPets).toHaveLength(1);
        expect(parsed.favoritesDisclaimerAccepted).toBe(true);
        expect(parsed.adoptionChecklists[101]).toBeDefined();
        expect(parsed.compactCardView).toBe(false);
    });

    it('normalizes compact card-view mode from transfer payloads', () => {
        const payload = {
            ...buildLegacyPayload(),
            compactCardView: 'true' as unknown as boolean,
        };

        const parsed = parseLocalAppStateImport(JSON.stringify(buildLocalAppStateExport(payload)));

        expect(parsed.compactCardView).toBe(true);
    });

    it('filters invalid and expired state records during import', () => {
        const now = Date.now();
        const payload = {
            favorites: [
                {
                    ...createPet({ ID: 101, Name: 'Milo', Species: 'Dog' }),
                    savedAt: now,
                },
                {
                    ...createPet({ ID: 102, Name: 'Expired', Species: 'Cat' }),
                    savedAt: now - (8 * 24 * 60 * 60 * 1000),
                },
            ],
            seenPets: [
                { id: 101, species: 'Dog', timestamp: now },
                { id: 102, species: 'Cat', timestamp: now - (31 * 24 * 60 * 60 * 1000) },
            ],
            seenEnabled: true,
            favoritesDisclaimerAccepted: true,
            searchPresets: [
                {
                    id: 'bad',
                    name: '  Valid   ',
                    selectedTab: 99,
                    filters: {
                        searchQuery: 'cats',
                        breed: ['Cat'],
                        gender: 'Female',
                        age: { min: 'bad', max: '4' },
                        stage: 'Available',
                        sortBy: 'age',
                        hideSeen: 'yes',
                    },
                },
            ],
            adoptionChecklists: {
                101: {
                    items: {
                        good_with_children: true,
                        unsupported: true,
                    },
                    notes: 'Hello',
                },
            },
        };

        const parsed = parseLocalAppStateImport(JSON.stringify(payload));

        expect(parsed.favorites).toHaveLength(1);
        expect(parsed.favorites[0].Name).toBe('Milo');
        expect(parsed.seenPets).toHaveLength(1);
        expect(parsed.seenPets[0]).toEqual({ id: 101, species: 'Dog', timestamp: now });
        expect(parsed.searchPresets).toHaveLength(1);
        expect(parsed.searchPresets[0].selectedTab).toBe(0);
        expect(parsed.searchPresets[0].filters.age).toEqual({ min: '', max: '4' });
        expect(parsed.adoptionChecklists[101].items.good_with_other_pets).toBe(false);
    });

    it('rejects malformed JSON payloads', () => {
        expect(() => parseLocalAppStateImport('{not-json')).toThrow('Backup file is not valid JSON.');
    });

    it('rejects unsupported schema and future app schema versions', () => {
        const payload = buildLocalAppStateExport(buildLegacyPayload());

        const unsupportedSchema = {
            ...payload,
            schema: 'bad-schema',
        };
        expect(() => parseLocalAppStateImport(JSON.stringify(unsupportedSchema))).toThrow('Unrecognized backup schema.');

        const newerVersion = {
            ...payload,
            version: LOCAL_APP_STATE_VERSION + 1,
        };
        expect(() => parseLocalAppStateImport(JSON.stringify(newerVersion))).toThrow('Backup file was created by a newer app version.');
    });
});
