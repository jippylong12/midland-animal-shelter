import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { act } from 'react';
import App from './App';
import theme from './theme';
import { buildDetailsXml, buildSearchXml, createPet, createPetDetails } from './test/fixtures';
import { NEW_MATCH_STORAGE_KEY } from './utils/newMatchTracker';
import { DATA_FRESHNESS_KEY } from './utils/dataFreshness';
import { SEARCH_PRESET_STORAGE_KEY } from './utils/searchPresets';
import { ADOPTION_CHECKLIST_STORAGE_KEY } from './utils/adoptionChecklist';
import { PERSONAL_FIT_ENABLED_KEY, PERSONAL_FIT_PREFERENCES_KEY } from './utils/personalFitScoring';
import { writeCachedPetDetails, writeCachedPetList } from './utils/offlineCache';

const toResponse = (body: string, status = 200): Response =>
    ({
        ok: status >= 200 && status < 300,
        status,
        text: async () => body,
    }) as Response;

const renderApp = () =>
    render(
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    );

const setLocationSearch = (search = '') => {
    const normalized = search ? `/?${search}` : '/';
    window.history.replaceState({}, '', normalized);
};

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        setLocationSearch('');
    });

    it('loads pets and applies the search filter', async () => {
        const pets = buildSearchXml([
            createPet({ ID: 1, Name: 'Rex', PrimaryBreed: 'Labrador Retriever', Species: 'Dog' }),
            createPet({ ID: 2, Name: 'Bella', PrimaryBreed: 'Beagle', Species: 'Dog', Sex: 'Female' }),
        ]);

        const fetchMock = vi.fn().mockResolvedValue(toResponse(pets));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Rex');
        expect(screen.getByText('Bella')).toBeInTheDocument();

        const searchInput = screen.getByLabelText('Search by name or breed');
        await userEvent.type(searchInput, 'bella');

        await waitFor(() => {
            expect(screen.queryByText('Rex')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Bella')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));
        await screen.findByText('Rex');
    });

    it('saves and reapplies a named search preset', async () => {
        const pets = buildSearchXml([
            createPet({ ID: 1, Name: 'Bella', Species: 'Dog', PrimaryBreed: 'Labrador Retriever' }),
            createPet({ ID: 2, Name: 'Rex', Species: 'Dog', PrimaryBreed: 'Beagle' }),
        ]);

        const fetchMock = vi.fn().mockResolvedValue(toResponse(pets));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Bella');

        await userEvent.click(screen.getByRole('button', { name: 'Show Advanced Filters' }));
        await userEvent.type(screen.getByRole('textbox', { name: 'Search by name or breed' }), 'bella');
        await userEvent.type(screen.getByLabelText('Preset name'), 'My Dogs');
        await userEvent.click(screen.getByRole('button', { name: 'Save Search Preset' }));

        await screen.findByText('My Dogs');

        await userEvent.clear(screen.getByRole('textbox', { name: 'Search by name or breed' }));
        await userEvent.type(screen.getByRole('textbox', { name: 'Search by name or breed' }), 'rex');
        expect(await screen.findByText('Rex')).toBeInTheDocument();
        expect(screen.queryByText('Bella')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'My Dogs' }));

        expect((screen.getByRole('textbox', { name: 'Search by name or breed' }) as HTMLInputElement).value).toBe('bella');
        expect(await screen.findByText('Bella')).toBeInTheDocument();
        expect(screen.queryByText('Rex')).not.toBeInTheDocument();

        const savedPresets = JSON.parse(localStorage.getItem(SEARCH_PRESET_STORAGE_KEY) || '[]');
        expect(savedPresets).toHaveLength(1);
        expect(savedPresets[0].name).toBe('My Dogs');
    });

    it('deletes a saved search preset', async () => {
        const pets = buildSearchXml([
            createPet({ ID: 1, Name: 'Bella', Species: 'Dog', PrimaryBreed: 'Labrador Retriever' }),
            createPet({ ID: 2, Name: 'Rex', Species: 'Dog', PrimaryBreed: 'Beagle' }),
        ]);

        const fetchMock = vi.fn().mockResolvedValue(toResponse(pets));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Bella');

        await userEvent.click(screen.getByRole('button', { name: 'Show Advanced Filters' }));
        await userEvent.type(screen.getByLabelText('Preset name'), 'Delete Me');
        await userEvent.click(screen.getByRole('button', { name: 'Save Search Preset' }));
        await screen.findByText('Delete Me');

        await userEvent.click(screen.getByLabelText('Delete preset Delete Me'));

        expect(screen.queryByRole('button', { name: 'Delete Me' })).not.toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(SEARCH_PRESET_STORAGE_KEY) || '[]')).toHaveLength(0);
    });

    it('hydrates tab/filter/page state from query params', async () => {
        const dogs = Array.from({ length: 60 }, (_, index) =>
            createPet({
                ID: index + 1,
                Name: `Buddy ${index + 1}`,
                Species: 'Dog',
                PrimaryBreed: 'Labrador Retriever',
                Sex: 'Female',
                Stage: 'Available',
                Age: 12,
            })
        );
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(dogs)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('tab=1&q=buddy&breed=Labrador%20Retriever&gender=Female&ageMin=1&ageMax=3&stage=Available&sort=age&hideSeen=true&page=3');
        renderApp();

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('speciesID=1'));
        });

        expect(window.location.search).toContain('page=3');
        expect(await screen.findByText('Buddy 41')).toBeInTheDocument();
        expect(screen.queryByText('Buddy 1')).not.toBeInTheDocument();
        expect((screen.getByRole('textbox', { name: 'Search by name or breed' }) as HTMLInputElement).value).toBe('buddy');
        expect(screen.getByRole('tab', { name: 'Dogs' })).toHaveAttribute('aria-selected', 'true');
        expect((screen.getByLabelText('Min age (yrs)') as HTMLInputElement).value).toBe('1');
        expect((screen.getByLabelText('Max age (yrs)') as HTMLInputElement).value).toBe('3');
    });

    it('ranks older pets first when personal fit age preference favors older pets', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Old Dog', Age: 120, Stage: 'Available', SpecialNeeds: '' }),
            createPet({ ID: 2, Name: 'Young Dog', Age: 6, Stage: 'Available', SpecialNeeds: '' }),
        ];
        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, JSON.stringify(true));
        localStorage.setItem(PERSONAL_FIT_PREFERENCES_KEY, JSON.stringify({
            agePreference: 90,
            stagePriority: 0,
            specialNeedsPriority: 0,
        }));

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('sort=score');
        renderApp();

        const getScores = () => screen.getAllByText(/^Personal fit:/i)
            .map((label) => Number(label.textContent?.match(/(\d+)/)?.[1]));
        await waitFor(() => {
            const scores = getScores();
            expect(scores).toHaveLength(2);
            expect(scores[0]).toBeGreaterThan(scores[1]);
        });
    });

    it('ranks younger pets first when personal fit age preference favors younger pets', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Old Dog', Age: 120, Stage: 'Available', SpecialNeeds: '' }),
            createPet({ ID: 2, Name: 'Young Dog', Age: 6, Stage: 'Available', SpecialNeeds: '' }),
        ];
        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, JSON.stringify(true));
        localStorage.setItem(PERSONAL_FIT_PREFERENCES_KEY, JSON.stringify({
            agePreference: 10,
            stagePriority: 0,
            specialNeedsPriority: 0,
        }));

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('sort=score');
        renderApp();

        const getScores = () => screen.getAllByText(/^Personal fit:/i)
            .map((label) => Number(label.textContent?.match(/(\d+)/)?.[1]));
        await waitFor(() => {
            const scores = getScores();
            expect(scores).toHaveLength(2);
            expect(scores[0]).toBeGreaterThan(scores[1]);
        });
    });

    it('hydrates and displays personal fit preferences from localStorage', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Rex', Age: 20 }),
            createPet({ ID: 2, Name: 'Luna', Age: 200 }),
        ];
        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, JSON.stringify(true));
        localStorage.setItem(PERSONAL_FIT_PREFERENCES_KEY, JSON.stringify({
            agePreference: 90,
            stagePriority: 10,
            specialNeedsPriority: 20,
        }));

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Rex');

        await userEvent.click(screen.getByRole('tab', { name: 'Settings' }));

        const ageSlider = screen.getByRole('slider', { name: 'Age profile' });
        const stageSlider = screen.getByRole('slider', { name: 'Stage preference' });
        const needsSlider = screen.getByRole('slider', { name: 'Special-needs preference' });
        expect(ageSlider).toHaveAttribute('aria-valuenow', '90');
        expect(stageSlider).toHaveAttribute('aria-valuenow', '10');
        expect(needsSlider).toHaveAttribute('aria-valuenow', '20');
    });

    it('renders personal fit controls in Settings tab and hides listing controls there', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Rex', Age: 20 }),
        ];
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Rex');

        await userEvent.click(screen.getByRole('tab', { name: 'Settings' }));

        expect(screen.getByRole('heading', { name: 'Personal fit scoring' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /Enable|Enabled/i })).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Search by name or breed' })).not.toBeInTheDocument();
    });

    it('enables personal fit from Settings and unlocks score sort', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Old Dog', Age: 120, Stage: 'Available', SpecialNeeds: '' }),
            createPet({ ID: 2, Name: 'Young Dog', Age: 6, Stage: 'Available', SpecialNeeds: '' }),
        ];

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Old Dog');
        expect(localStorage.getItem(PERSONAL_FIT_ENABLED_KEY)).toBeNull();

        await userEvent.click(screen.getByRole('tab', { name: 'Settings' }));
        await userEvent.click(screen.getByRole('checkbox', { name: /Enable personal fit scoring|Enable|Enabled/i }));
        expect(localStorage.getItem(PERSONAL_FIT_ENABLED_KEY)).toBe('true');

        await userEvent.click(screen.getByRole('tab', { name: 'All Pets' }));
        await userEvent.click(screen.getByRole('button', { name: 'Show Advanced Filters' }));

        const sortSelect = screen.getByRole('combobox', { name: 'Sort by' });
        await userEvent.click(sortSelect);
        expect(await screen.findByRole('option', { name: 'Personal fit score' })).toBeEnabled();
    });

    it('does not sort by personal fit by default', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Old Dog', Age: 120, Stage: 'Available', SpecialNeeds: '' }),
            createPet({ ID: 2, Name: 'Young Dog', Age: 6, Stage: 'Available', SpecialNeeds: '' }),
        ];

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('sort=score');
        renderApp();
        await screen.findByText('Old Dog');

        const oldDog = screen.getByText('Old Dog');
        const youngDog = screen.getByText('Young Dog');
        expect(oldDog.compareDocumentPosition(youngDog) & Node.DOCUMENT_POSITION_FOLLOWING)
            .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(screen.queryByText(/^Personal fit:/i)).not.toBeInTheDocument();
        expect((screen.getByRole('textbox', { name: /search by name or breed/i }) as HTMLInputElement).value).toBe('');
    });

    it('requires opt-in before score sorting and score badges appear', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Old Dog', Age: 120, Stage: 'Available', SpecialNeeds: '' }),
            createPet({ ID: 2, Name: 'Young Dog', Age: 6, Stage: 'Available', SpecialNeeds: '' }),
        ];
        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, JSON.stringify(false));
        localStorage.setItem(PERSONAL_FIT_PREFERENCES_KEY, JSON.stringify({
            agePreference: 90,
            stagePriority: 0,
            specialNeedsPriority: 0,
        }));
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        const firstRender = renderApp();
        await screen.findByText('Old Dog');

        await userEvent.click(screen.getByRole('button', { name: 'Show Advanced Filters' }));

        const sortSelect = screen.getByRole('combobox', { name: 'Sort by' });
        await userEvent.click(sortSelect);
        const scoreOption = await screen.findByRole('option', { name: 'Personal fit score (enable first)' });
        expect(scoreOption).toHaveAttribute('aria-disabled', 'true');

        expect(screen.queryByText(/^Personal fit:/i)).not.toBeInTheDocument();
        firstRender.unmount();

        localStorage.setItem(PERSONAL_FIT_ENABLED_KEY, JSON.stringify(true));
        renderApp();
        await screen.findByText('Old Dog');

        await userEvent.click(screen.getByRole('button', { name: 'Show Advanced Filters' }));
        const enabledSortSelect = screen.getByRole('combobox', { name: 'Sort by' });
        await userEvent.click(enabledSortSelect);
        await userEvent.click(await screen.findByRole('option', { name: 'Personal fit score' }));

        const scores = await screen.findAllByText(/^Personal fit:/i);
        expect(scores).toHaveLength(2);
        expect(window.location.search).toContain('sort=score');
        expect(localStorage.getItem(PERSONAL_FIT_ENABLED_KEY)).toBe('true');
    });

    it('stores last successful pet fetch time by tab and displays freshness message', async () => {
        const pets = [createPet({ ID: 1, Name: 'Rex', Species: 'Dog' })];
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Rex');

        expect(screen.getByText(/Data freshness/i)).toBeInTheDocument();
        expect(screen.getByText(/Last successful sync for All Pets was/i)).toBeInTheDocument();
        expect(screen.queryByText(/Data may be stale due to delayed API responses/i)).not.toBeInTheDocument();

        const stored = JSON.parse(localStorage.getItem(DATA_FRESHNESS_KEY) || '{}');
        expect(typeof stored).toBe('object');
        expect(stored[0]).toBeGreaterThan(0);
        expect(stored[0]).toBeLessThanOrEqual(Date.now());
    });

    it('warns when cached sync data is stale', async () => {
        const staleTimestamp = Date.now() - (16 * 60 * 1000);
        localStorage.setItem(DATA_FRESHNESS_KEY, JSON.stringify({ 0: staleTimestamp }));

        const fetchMock = vi.fn().mockResolvedValue(toResponse('server-error', 500));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        expect(await screen.findByText('HTTP error! status: 500')).toBeInTheDocument();
        expect(screen.getByText(/Data may be stale due to delayed API responses/i)).toBeInTheDocument();
    });

    it('uses cached pets when the list request fails', async () => {
        const cachedPets = [
            createPet({ ID: 101, Name: 'Cachey', Species: 'Dog', Stage: 'Available' }),
        ];
        writeCachedPetList(0, 0, cachedPets);

        const fetchMock = vi.fn().mockResolvedValue(toResponse('server-error', 500));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();

        expect(await screen.findByText('Cachey')).toBeInTheDocument();
        expect(screen.queryByText('HTTP error! status: 500')).not.toBeInTheDocument();
        expect(screen.getByText(/Offline: cached list/i)).toBeInTheDocument();
        expect(screen.getByText(/Showing cached.*all pets/i)).toBeInTheDocument();
    });

    it('shows cached details when detail fetch fails', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const details = createPetDetails({
            ID: 77,
            AnimalName: 'Ranger',
            Species: 'Dog',
            PrimaryBreed: 'Shepherd',
            Stage: 'Available',
            AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
        });
        writeCachedPetDetails(details);

        const fetchMock = vi.fn((url: string) => {
            if (url.includes('speciesID=')) {
                return Promise.resolve(toResponse(searchXml));
            }

            return Promise.resolve(toResponse('server-error', 500));
        });
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');

        await userEvent.click(screen.getByText('Ranger'));

        expect(await screen.findByText(/offline mode: showing cached pet details/i)).toBeInTheDocument();
        expect(await screen.findByRole('link', { name: /adopt ranger/i })).toBeInTheDocument();
    });

    it('highlights pets that are new since the last snapshot', async () => {
        localStorage.setItem(
            NEW_MATCH_STORAGE_KEY,
            JSON.stringify({
                dog: { ids: ['1'], updatedAt: 1_000 },
            })
        );

        const dogs = [
            createPet({ ID: 1, Name: 'Rex', Species: 'Dog' }),
            createPet({ ID: 2, Name: 'Luna', Species: 'Dog' }),
        ];
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(dogs)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();

        await screen.findByText('Rex');
        expect(screen.getAllByText('NEW')).toHaveLength(1);
        expect(screen.getByText('Luna')).toBeInTheDocument();

        const stored = JSON.parse(localStorage.getItem(NEW_MATCH_STORAGE_KEY) || '{}');
        expect(stored.dog.ids.sort()).toEqual(['1', '2']);
    });

    it('clears new-match history for the current tab', async () => {
        localStorage.setItem(
            NEW_MATCH_STORAGE_KEY,
            JSON.stringify({
                dog: { ids: ['1'], updatedAt: 1_000 },
            })
        );

        const dogs = [
            createPet({ ID: 1, Name: 'Rex', Species: 'Dog' }),
            createPet({ ID: 2, Name: 'Luna', Species: 'Dog' }),
        ];
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(dogs)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();

        await screen.findByText('Luna');
        expect(screen.getAllByText('NEW')).toHaveLength(1);

        await userEvent.click(screen.getByRole('button', { name: 'Show Advanced Filters' }));
        await userEvent.click(screen.getByRole('button', { name: /clear new matches/i }));
        await waitFor(() => {
            expect(screen.queryByText('NEW')).not.toBeInTheDocument();
        });

        const stored = JSON.parse(localStorage.getItem(NEW_MATCH_STORAGE_KEY) || '{}');
        expect(stored.dog.ids.sort()).toEqual(['1', '2']);
    });

    it('adds and removes pets from the compare tray', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Rex', Species: 'Dog' }),
            createPet({ ID: 2, Name: 'Luna', Species: 'Dog' }),
        ];
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Rex');

        await userEvent.click(screen.getByRole('button', { name: 'Add Rex to compare' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add Luna to compare' }));

        const compareTray = screen.getByRole('region', { name: /compare tray/i });
        expect(within(compareTray).getByText('Rex')).toBeInTheDocument();
        expect(within(compareTray).getByText('Luna')).toBeInTheDocument();

        await userEvent.click(within(compareTray).getByRole('button', { name: 'Remove Rex from compare' }));

        await waitFor(() => {
            expect(within(compareTray).queryByText('Rex')).not.toBeInTheDocument();
        });
    });

    it('limits compare tray selections to three pets', async () => {
        const pets = [
            createPet({ ID: 1, Name: 'Rex', Species: 'Dog' }),
            createPet({ ID: 2, Name: 'Luna', Species: 'Dog' }),
            createPet({ ID: 3, Name: 'Milo', Species: 'Dog' }),
            createPet({ ID: 4, Name: 'Max', Species: 'Dog' }),
        ];
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Rex');

        await userEvent.click(screen.getByRole('button', { name: 'Add Rex to compare' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add Luna to compare' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add Milo to compare' }));

        const compareTray = screen.getByRole('region', { name: /compare tray/i });
        expect(within(compareTray).getByText(/3\/3/)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'Add Max to compare' })).toBeDisabled();

        await userEvent.click(within(compareTray).getByRole('button', { name: 'Remove Rex from compare' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add Max to compare' }));

        expect(within(compareTray).getByText('Max')).toBeInTheDocument();
    });

    it('shows compare markers for favorites and seen pets', async () => {
        const now = Date.now();
        const favorites = { ...createPet({ ID: 12, Name: 'Mochi', Species: 'Dog' }), savedAt: now };
        const seen = [{ id: 12, species: 'Dog', timestamp: now }];

        localStorage.setItem('shelter_favorites_disclaimer', 'true');
        localStorage.setItem('shelter_favorites', JSON.stringify([favorites]));
        localStorage.setItem('seenPetsEnabled', JSON.stringify(true));
        localStorage.setItem('seenPets', JSON.stringify(seen));

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml([favorites])));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Mochi');

        await userEvent.click(screen.getByRole('button', { name: 'Add Mochi to compare' }));

        const compareTray = screen.getByRole('region', { name: /compare tray/i });
        expect(within(compareTray).getByText('Favorite')).toBeInTheDocument();
        expect(within(compareTray).getByText('Seen')).toBeInTheDocument();
    });

    it('switches species tabs and requests the correct endpoint', async () => {
        const allPetsXml = buildSearchXml([
            createPet({ ID: 10, Name: 'Whiskers', Species: 'Cat', PrimaryBreed: 'Siamese' }),
        ]);
        const dogsXml = buildSearchXml([
            createPet({ ID: 11, Name: 'Bolt', Species: 'Dog', PrimaryBreed: 'Husky' }),
        ]);

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(toResponse(allPetsXml))
            .mockResolvedValueOnce(toResponse(dogsXml));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Whiskers');

        await userEvent.click(screen.getByRole('tab', { name: 'Dogs' }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('speciesID=1'));
        });
        await screen.findByText('Bolt');
    });

    it('paginates when result count exceeds one page', async () => {
        const pets = Array.from({ length: 25 }, (_, index) =>
            createPet({ ID: index + 1, Name: `Pet ${index + 1}`, Species: 'Dog', PrimaryBreed: 'Mixed Breed' })
        );

        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(pets)));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Pet 1');
        expect(screen.getByText('Pet 1')).toBeInTheDocument();
        expect(screen.queryByText('Pet 21')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));

        expect(await screen.findByText('Pet 21')).toBeInTheDocument();
        expect(screen.getByText('Pet 21')).toBeInTheDocument();
    });

    it('opens the details modal and loads adoptable details', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
                AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
            })
        );

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(toResponse(searchXml))
            .mockResolvedValueOnce(toResponse(detailsXml));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');

        await userEvent.click(screen.getByText('Ranger'));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('animalID=77'));
        });
        expect(await screen.findByRole('link', { name: /adopt ranger/i })).toBeInTheDocument();
    });

    it('copies a generated pet summary to clipboard from the modal', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
                AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
            })
        );

        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        const navigatorLike = navigator as unknown as { clipboard?: { writeText: (text: string) => Promise<void> } };
        const originalClipboard = navigatorLike.clipboard;
        navigatorLike.clipboard = { writeText: writeTextMock };

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(toResponse(searchXml))
            .mockResolvedValueOnce(toResponse(detailsXml));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');

        await userEvent.click(screen.getByText('Ranger'));
        const modal = await screen.findByRole('dialog');
        expect(within(modal).getByRole('link', { name: /adopt ranger/i })).toBeInTheDocument();
        const copyButton = await within(modal).findByRole('button', { name: /copy .*summary/i });
        await userEvent.click(copyButton);

        expect(writeTextMock).toHaveBeenCalledTimes(1);
        expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('Pet Name: Ranger'));
        expect(await screen.findByText(/pet summary copied to clipboard/i)).toBeInTheDocument();

        navigatorLike.clipboard = originalClipboard;
    });

    it('falls back to document.execCommand when clipboard API is not available', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
            })
        );

        const navigatorLike = navigator as unknown as { clipboard?: { writeText?: (text: string) => Promise<void> } };
        const originalClipboard = navigatorLike.clipboard;
        navigatorLike.clipboard = undefined;
        const documentWithExec = document as unknown as {
            execCommand?: (command: string) => boolean;
        };
        const originalExecCommand = documentWithExec.execCommand;
        const execCommandSpy = vi.fn().mockReturnValue(true);
        documentWithExec.execCommand = execCommandSpy;

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(toResponse(searchXml))
            .mockResolvedValueOnce(toResponse(detailsXml));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');

        await userEvent.click(screen.getByText('Ranger'));
        const modal = await screen.findByRole('dialog');
        expect(within(modal).getByRole('button', { name: /close pet details/i })).toBeInTheDocument();
        const copyButton = await within(modal).findByRole('button', { name: /copy .*summary/i });
        await userEvent.click(copyButton);

        expect(execCommandSpy).toHaveBeenCalledWith('copy');
        expect(await screen.findByText(/pet summary copied to clipboard/i)).toBeInTheDocument();

        documentWithExec.execCommand = originalExecCommand;
        navigatorLike.clipboard = originalClipboard;
    });

    it('shows a fallback error when neither clipboard path can copy', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
            })
        );

        const navigatorLike = navigator as unknown as {
            clipboard?: { writeText?: (text: string) => Promise<void> };
        };
        const originalClipboard = navigatorLike.clipboard;
        navigatorLike.clipboard = undefined;
        const documentWithExec = document as unknown as {
            execCommand?: (command: string) => boolean;
        };
        const originalExecCommand = documentWithExec.execCommand;
        const execCommandSpy = vi.fn().mockReturnValue(false);
        documentWithExec.execCommand = execCommandSpy;

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(toResponse(searchXml))
            .mockResolvedValueOnce(toResponse(detailsXml));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');

        await userEvent.click(screen.getByText('Ranger'));
        const modal = await screen.findByRole('dialog');
        const copyButton = await within(modal).findByRole('button', { name: /copy .*summary/i });
        await userEvent.click(copyButton);

        expect(execCommandSpy).toHaveBeenCalledWith('copy');
        expect(await screen.findByText(/unable to copy summary automatically/i)).toBeInTheDocument();

        documentWithExec.execCommand = originalExecCommand;
        navigatorLike.clipboard = originalClipboard;
    });

    it('labels icon-only card and modal controls for screen readers', async () => {
        localStorage.setItem('shelter_favorites_disclaimer', 'true');
        localStorage.setItem('seenPetsEnabled', JSON.stringify(true));
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
                AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
            })
        );
        const fetchMock = vi.fn((url: string) => {
            if (url.includes('speciesID=')) {
                return Promise.resolve(toResponse(searchXml));
            }
            return Promise.resolve(toResponse(detailsXml));
        });
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');

        expect(screen.getByRole('button', { name: 'Add Ranger to favorites' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mark Ranger as seen' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Ranger to compare' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /^Ranger/ }));
        const modal = await screen.findByRole('dialog');

        expect(within(modal).getByRole('button', { name: /add ranger .*favorites/i })).toBeInTheDocument();
        expect(within(modal).getByRole('button', { name: /add ranger .*compare/i })).toBeInTheDocument();
        expect(within(modal).getByRole('button', { name: /close pet details/i })).toBeInTheDocument();
    });

    it('supports keyboard modal open/close flow and restores focus to the source card', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
            })
        );
        const fetchMock = vi.fn((url: string) => {
            if (url.includes('speciesID=')) {
                return Promise.resolve(toResponse(searchXml));
            }
            return Promise.resolve(toResponse(detailsXml));
        });
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        const cardAction = await screen.findByRole('button', { name: /^Ranger/ });
        cardAction.focus();

        await userEvent.keyboard('{Enter}');
        const closeButton = await screen.findByRole('button', { name: /close pet details/i });
        expect(closeButton).toHaveFocus();

        await userEvent.keyboard('{Escape}');
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(cardAction).toHaveFocus();
        });
    });

    it('persists checklist and notes for a pet in the modal', async () => {
        const searchXml = buildSearchXml([
            createPet({ ID: 77, Name: 'Ranger', Species: 'Dog', PrimaryBreed: 'Shepherd' }),
        ]);
        const detailsXml = buildDetailsXml(
            createPetDetails({
                ID: 77,
                AnimalName: 'Ranger',
                Species: 'Dog',
                PrimaryBreed: 'Shepherd',
                Stage: 'Available',
                AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
            })
        );
        const fetchMock = vi.fn((url: string) => {
            if (url.includes('speciesID=')) {
                return Promise.resolve(toResponse(searchXml));
            }
            return Promise.resolve(toResponse(detailsXml));
        });
        vi.stubGlobal('fetch', fetchMock);

        renderApp();
        await screen.findByText('Ranger');
        await userEvent.click(screen.getByText('Ranger'));

        await userEvent.click(await screen.findByRole('button', { name: 'Adoption Checklist' }));
        const childrenCheck = await screen.findByRole('checkbox', { name: 'Good with children' });
        const notes = await screen.findByLabelText('Household Notes');

        await userEvent.click(childrenCheck);
        await userEvent.type(notes, 'Needs a fenced yard.');

        const rawStored = localStorage.getItem(ADOPTION_CHECKLIST_STORAGE_KEY);
        expect(rawStored).not.toBeNull();
        const stored = rawStored ? JSON.parse(rawStored) : {};
        expect(stored[77].items).toEqual({
            good_with_children: true,
            good_with_other_pets: false,
            energy_level_fit: false,
        });
        expect(stored[77].notes).toBe('Needs a fenced yard.');

        await userEvent.click(screen.getByRole('button', { name: /close pet details/i }));
        await userEvent.click(screen.getByText('Ranger'));

        await userEvent.click(await screen.findByRole('button', { name: 'Adoption Checklist' }));
        expect(await screen.findByRole('checkbox', { name: 'Good with children' })).toBeChecked();
        expect((await screen.findByLabelText('Household Notes') as HTMLTextAreaElement).value).toBe('Needs a fenced yard.');
    });

    it('shows a request error when the pet list fetch fails', async () => {
        const fetchMock = vi.fn().mockResolvedValue(toResponse('server-error', 500));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();

        expect(await screen.findByText('HTTP error! status: 500')).toBeInTheDocument();
    });

    it('keeps URL query in sync when filters and pagination change', async () => {
        const dogs = Array.from({ length: 60 }, (_, index) =>
            createPet({
                ID: index + 1,
                Name: `Buddy ${index + 1}`,
                Species: 'Dog',
                PrimaryBreed: 'Labrador Retriever',
            })
        );
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(toResponse(buildSearchXml(dogs)))
            .mockResolvedValueOnce(toResponse(buildSearchXml(dogs)))
            .mockResolvedValueOnce(toResponse(buildSearchXml(dogs)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('q=buddy');
        renderApp();
        await screen.findByText('Buddy 1');

        await userEvent.click(screen.getByRole('tab', { name: 'Dogs' }));
        expect(await screen.findByText('Buddy 1')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /go to page 2/i }));

        await waitFor(() => {
            expect(screen.getByText('Buddy 21')).toBeInTheDocument();
        });
        expect(window.location.search).toContain('tab=1');
        expect(window.location.search).toContain('q=buddy');
        expect(window.location.search).toContain('page=2');
    });

    it('re-hydrates tab and filters on browser back/forward navigation', async () => {
        const initialPets = Array.from({ length: 20 }, (_, index) =>
            createPet({
                ID: index + 1,
                Name: `Rex ${index + 1}`,
                Species: index % 2 === 0 ? 'Dog' : 'Cat',
            })
        );
        const catPets = Array.from({ length: 25 }, (_, index) =>
            createPet({
                ID: 100 + index + 1,
                Name: `Cat ${index + 1}`,
                Species: 'Cat',
                Sex: 'Female',
                PrimaryBreed: 'Tabby',
                Stage: 'Available',
                Age: 180,
            })
        );
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(toResponse(buildSearchXml(initialPets)))
            .mockResolvedValueOnce(toResponse(buildSearchXml(catPets)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('');
        renderApp();
        await screen.findByText('Rex 1');

        window.history.pushState({}, '', '/?tab=2&q=cat&gender=Female&ageMin=12&ageMax=20&stage=Available&sort=breed&page=2');
        act(() => {
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        await waitFor(() => {
            expect(screen.getByRole('tab', { name: 'Cats' })).toHaveAttribute('aria-selected', 'true');
        });
        expect((screen.getByRole('textbox', { name: 'Search by name or breed' }) as HTMLInputElement).value).toBe('cat');
        expect(screen.getByRole('combobox', { name: 'Gender' })).toHaveTextContent('Female');
        expect((screen.getByLabelText('Min age (yrs)') as HTMLInputElement).value).toBe('12');
        expect((screen.getByLabelText('Max age (yrs)') as HTMLInputElement).value).toBe('20');
        expect(window.location.search).toContain('page=2');
        expect(await screen.findByText('Cat 21')).toBeInTheDocument();
        expect(screen.queryByText('Cat 1')).not.toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('speciesID=2'));
    });

    it('falls back to safe defaults for invalid query params', async () => {
        const dogs = Array.from({ length: 2 }, (_, index) =>
            createPet({
                ID: index + 1,
                Name: `Dog ${index + 1}`,
                Species: 'Dog',
                PrimaryBreed: 'Bulldog',
            })
        );
        const fetchMock = vi.fn().mockResolvedValue(toResponse(buildSearchXml(dogs)));
        vi.stubGlobal('fetch', fetchMock);

        setLocationSearch('tab=99&q=dog&ageMin=invalid&sort=weird&hideSeen=maybe&page=-1');
        renderApp();

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('speciesID=0'));
        });
        expect(screen.getByRole('tab', { name: 'All Pets' })).toHaveAttribute('aria-selected', 'true');
        expect((screen.getByRole('textbox', { name: 'Search by name or breed' }) as HTMLInputElement).value).toBe('dog');
        expect((screen.getByLabelText('Min age (yrs)') as HTMLInputElement).value).toBe('');
        expect((screen.getByLabelText('Max age (yrs)') as HTMLInputElement).value).toBe('');
        expect(window.location.search).not.toContain('sort=');
        expect(window.location.search).not.toMatch('page=');
    });
});
