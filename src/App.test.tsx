import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { act } from 'react';
import App from './App';
import theme from './theme';
import { buildDetailsXml, buildSearchXml, createPet, createPetDetails } from './test/fixtures';
import { NEW_MATCH_STORAGE_KEY } from './utils/newMatchTracker';

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
