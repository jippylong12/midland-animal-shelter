import {
    createSearchPreset,
    readSearchPresets,
    writeSearchPresets,
    normalizeSearchPresetFilters,
    SEARCH_PRESET_STORAGE_KEY,
} from './searchPresets';

describe('searchPresets', () => {
    it('ignores malformed storage payloads', () => {
        localStorage.setItem(SEARCH_PRESET_STORAGE_KEY, 'not-json');
        expect(readSearchPresets()).toEqual([]);
    });

    it('normalizes legacy/invalid preset fields on read', () => {
        localStorage.setItem(
            SEARCH_PRESET_STORAGE_KEY,
            JSON.stringify([
                {
                    id: '',
                    name: '  Dogs Near  ',
                    selectedTab: 99,
                    filters: {
                        searchQuery: '  Bella  ',
                        breed: ['Dog', '', 'Dog', 14],
                        gender: 'Female',
                        age: { min: '2', max: 'abc' },
                        stage: '  Available ',
                        sortBy: 'weird',
                        hideSeen: 'yes',
                    },
                },
            ])
        );

        const presets = readSearchPresets();
        expect(presets).toHaveLength(1);
        expect(presets[0]).toMatchObject({
            id: expect.any(String),
            name: 'Dogs Near',
            selectedTab: 0,
            filters: {
                searchQuery: 'Bella',
                breed: ['Dog'],
                gender: 'Female',
                age: { min: '2', max: '' },
                stage: 'Available',
                sortBy: '',
                hideSeen: false,
            },
            createdAt: expect.any(Number),
        });
    });

    it('normalizes filters used when creating presets', () => {
        const filters = normalizeSearchPresetFilters({
            searchQuery: '  Rex  ',
            breed: ['  Dog ', '', 42],
            gender: 'Male',
            age: { min: 4, max: '5' },
            stage: 'Available ',
            sortBy: 'age',
            hideSeen: true,
        });

        const preset = createSearchPreset('  Test Preset  ', 1, filters);

        expect(preset).toMatchObject({
            name: 'Test Preset',
            selectedTab: 1,
            filters,
            id: expect.any(String),
            createdAt: expect.any(Number),
        });
        expect(preset.filters.gender).toBe('Male');
        expect(preset.filters.age).toEqual({ min: '4', max: '5' });
    });

    it('writes and reads search presets to localStorage', () => {
        const preset = createSearchPreset('Saved', 2, {
            searchQuery: 'buddy',
            breed: ['Lab'],
            gender: 'Female',
            age: { min: '1', max: '5' },
            stage: 'Available',
            sortBy: 'breed',
            hideSeen: false,
        });

        writeSearchPresets([preset]);
        const raw = localStorage.getItem(SEARCH_PRESET_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;

        expect(parsed).not.toBeNull();
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toMatchObject({
            id: preset.id,
            name: 'Saved',
            selectedTab: 2,
            filters: {
                searchQuery: 'buddy',
                breed: ['Lab'],
                gender: 'Female',
                age: { min: '1', max: '5' },
                stage: 'Available',
                sortBy: 'breed',
                hideSeen: false,
            },
        });
        expect(readSearchPresets()).toHaveLength(1);
    });
});
