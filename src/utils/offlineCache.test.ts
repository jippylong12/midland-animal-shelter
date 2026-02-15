import { readCachedPetDetails, readCachedPetList, writeCachedPetDetails, writeCachedPetList } from './offlineCache';
import { createPet, createPetDetails } from '../test/fixtures';

describe('offlineCache', () => {
    it('writes and reads a cached pet list for a tab', () => {
        const pets = [
            createPet({ ID: 101, Name: 'Nova', Species: 'Cat' }),
            createPet({ ID: 102, Name: 'Rex', Species: 'Dog' }),
        ];

        const entry = writeCachedPetList(1, 1, pets);
        expect(entry).not.toBeNull();
        expect(entry?.speciesId).toBe(1);
        expect(entry?.pets).toHaveLength(2);

        const cached = readCachedPetList(1);
        expect(cached?.speciesId).toBe(1);
        expect(cached?.pets).toHaveLength(2);
        expect(cached?.pets[0].Name).toBe('Nova');
    });

    it('ignores malformed list cache payload entries', () => {
        localStorage.setItem('shelter_offline_pet_list_cache', JSON.stringify({
            2: {
                timestamp: 1700000000000,
                speciesId: 2,
                pets: [
                    { Name: 'Bad pet record' },
                    { ID: 333, Name: 'Good pet', Species: 'Dog' },
                ],
            },
        }));

        const cached = readCachedPetList(2);
        expect(cached).not.toBeNull();
        expect(cached?.pets).toHaveLength(1);
        expect(cached?.pets[0].Name).toBe('Good pet');
    });

    it('writes and reads cached pet details', () => {
        const details = createPetDetails({
            ID: 77,
            AnimalName: 'Ranger',
            Species: 'Dog',
            AdoptionApplicationUrl: 'https://example.com/adopt/ranger',
        });

        const entry = writeCachedPetDetails(details);
        expect(entry).not.toBeNull();

        const cached = readCachedPetDetails(77);
        expect(cached).not.toBeNull();
        expect(cached?.details.ID).toBe(77);
        expect(cached?.details.AnimalName).toBe('Ranger');
        expect(cached?.details.AdoptionApplicationUrl).toBe('https://example.com/adopt/ranger');
    });

    it('ignores malformed detail cache payload entries', () => {
        localStorage.setItem('shelter_offline_pet_details_cache', JSON.stringify({
            88: {
                timestamp: 1700000000000,
                details: {
                    ID: 'not-a-number',
                },
            },
        }));

        const cached = readCachedPetDetails(88);
        expect(cached).toBeNull();
    });
});
