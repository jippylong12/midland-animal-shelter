import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import theme from './theme';
import { buildDetailsXml, buildSearchXml, createPet, createPetDetails } from './test/fixtures';

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

describe('App', () => {
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
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
        expect(screen.queryByText('Pet 21')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));

        await screen.findByText('Page 2 of 2');
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
        expect(await screen.findByRole('link', { name: 'Adopt Ranger' })).toBeInTheDocument();
    });

    it('shows a request error when the pet list fetch fails', async () => {
        const fetchMock = vi.fn().mockResolvedValue(toResponse('server-error', 500));
        vi.stubGlobal('fetch', fetchMock);

        renderApp();

        expect(await screen.findByText('HTTP error! status: 500')).toBeInTheDocument();
    });
});
