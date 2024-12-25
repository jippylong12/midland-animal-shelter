// src/App.tsx

import { useState, useEffect } from 'react';
import './App.css';
import { XMLParser } from 'fast-xml-parser';
import { AdoptableSearch, Root } from './types';

function App() {
    // State for search query
    const [searchQuery, setSearchQuery] = useState('');
    const parser = new XMLParser();

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState<'All Pets' | 'Dogs' | 'Cats' | 'Small Animals'>('All Pets');

    // States for filters
    const [breed, setBreed] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');

    // State for pets data
    const [pets, setPets] = useState<AdoptableSearch[]>([]);

    // State for loading and error
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Handler functions
    const handleTabClick = (tab: 'All Pets' | 'Dogs' | 'Cats' | 'Small Animals') => {
        setSelectedTab(tab);
        // Reset filters when tab changes (optional)
        setBreed('');
        setGender('');
        setAge('');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBreed(e.target.value);
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGender(e.target.value);
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAge(e.target.value);
    };

    // Effect to make API request
    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await fetch('https://jztmocmwmf.execute-api.us-east-2.amazonaws.com/Production/COMAPI?speciesID=1');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlData = await response.text();
                const jsonObj = parser.parse(xmlData) as Root;

                // Access the ArrayOfXmlNode.XmlNode property with type guards
                let xmlNodes = jsonObj['ns0:ArrayOfXmlNode']?.['ns0:XmlNode'];

                if (!xmlNodes) {
                    throw new Error('No XmlNode found in the API response.');
                }

                // Ensure xmlNodes is always an array
                if (!Array.isArray(xmlNodes)) {
                    xmlNodes = [xmlNodes];
                }

                // Initialize an empty array to hold AdoptableSearch items
                const adoptableSearchList: AdoptableSearch[] = [];

                // Use forEach to iterate over xmlNodes and populate adoptableSearchList
                xmlNodes.forEach((node) => {
                    if (node.adoptableSearch) {
                        adoptableSearchList.push(node.adoptableSearch);
                    }
                });

                setPets(adoptableSearchList);
            } catch (err: any) {
                console.error('Error fetching pets:', err);
                setError(err.message || 'Failed to fetch pets.');
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, []); // Empty dependency array ensures this runs once on mount

    // Filter pets based on search and filters
    const filteredPets = pets.filter((pet) => {
        // Filter by tab
        if (selectedTab !== 'All Pets') {
            if (selectedTab === 'Dogs' && pet.Species !== 'Dog') return false;
            if (selectedTab === 'Cats' && pet.Species !== 'Cat') return false;
            if (selectedTab === 'Small Animals' && pet.Species !== 'Small Animal') return false;
        }

        // Filter by search query
        if (searchQuery && !pet.PrimaryBreed.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Filter by breed
        if (breed && !pet.PrimaryBreed.toLowerCase().includes(breed.toLowerCase())) return false;

        // Filter by gender
        if (gender && pet.Sex !== gender) return false;

        // Filter by age
        if (age && pet.Age.toString() !== age) return false;

        return true;
    });

    console.log(pets);
    console.log(pets[0]);

    // Extract unique breeds for the breed filter dropdown using forEach
    const uniqueBreedsSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.PrimaryBreed) {
            uniqueBreedsSet.add(pet.PrimaryBreed);
        }
    });
    const uniqueBreeds = Array.from(uniqueBreedsSet).sort();

    // Extract unique ages for the age filter dropdown using forEach
    const uniqueAgesSet = new Set<number>();
    pets.forEach((pet) => {
        if (pet.Age !== undefined && pet.Age !== null) {
            uniqueAgesSet.add(pet.Age);
        }
    });
    const uniqueAges = Array.from(uniqueAgesSet).sort((a, b) => a - b);

    return (
        <div className="App">
            <div className="container">
                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by breed..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Tab Bar */}
                <div className="tab-bar">
                    {['All Pets', 'Dogs', 'Cats', 'Small Animals'].map((tab) => (
                        <button
                            key={tab}
                            className={selectedTab === tab ? 'active' : ''}
                            onClick={() => handleTabClick(tab as 'All Pets' | 'Dogs' | 'Cats' | 'Small Animals')}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="filters">
                    {/* Breed Filter */}
                    <select value={breed} onChange={handleBreedChange}>
                        <option value="">All Breeds</option>
                        {uniqueBreeds.map((breedOption, index) => (
                            <option key={index} value={breedOption}>
                                {breedOption}
                            </option>
                        ))}
                    </select>

                    {/* Gender Filter */}
                    <select value={gender} onChange={handleGenderChange}>
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    {/* Age Filter */}
                    <select value={age} onChange={handleAgeChange}>
                        <option value="">All Ages</option>
                        {uniqueAges.map((ageOption, index) => (
                            <option key={index} value={ageOption}>
                                {ageOption} Year{ageOption !== 1 ? 's' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Display Loading, Error, or Pet List */}
                {loading ? (
                    <p>Loading pets...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div className="pet-list">
                        {filteredPets.length > 0 ? (
                            filteredPets.map((pet) => (
                                <div key={pet.ID} className="pet-card">
                                    <img src={pet.Photo} alt={pet.Name} className="pet-photo" />
                                    <h3>{pet.Name}</h3>
                                    <p><strong>Species:</strong> {pet.Species}</p>
                                    <p><strong>Breed:</strong> {pet.PrimaryBreed} {pet.SecondaryBreed && `(${pet.SecondaryBreed})`}</p>
                                    <p><strong>Gender:</strong> {pet.Sex}</p>
                                    <p><strong>Age:</strong> {pet.Age} Year{pet.Age !== 1 ? 's' : ''}</p>
                                    <p><strong>Location:</strong> {pet.Location}</p>
                                    <p><strong>Stage:</strong> {pet.Stage}</p>
                                    {/* Add more fields as needed */}
                                </div>
                            ))
                        ) : (
                            <p>No pets found matching your criteria.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;