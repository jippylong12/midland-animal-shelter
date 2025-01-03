// src/App.tsx

import React, { useState, useEffect } from 'react';
import './App.css';
import { XMLParser } from 'fast-xml-parser';
import {
    AdoptableDetails,
    AdoptableSearch,
    Root,
} from './types';
import {SelectChangeEvent, useMediaQuery} from '@mui/material';

// MUI Icons
import PetsIcon from '@mui/icons-material/Pets';
import DogIcon from '@mui/icons-material/EmojiNature'; // Replace with appropriate icons
import CatIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons
import SmallAnimalIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons

// MUI Components
import {
    Box,
} from '@mui/material';

// Custom Components
import Header from './components/Header';
import Filters from './components/Filters';
import PetList from './components/PetList';
import PetModal from './components/PetModal';
import Footer from './components/Footer';
import PaginationControls from './components/PaginationControls';

function App() {
    // State for search query
    const [searchQuery, setSearchQuery] = useState('');
    const parser = new XMLParser();

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const tabLabels: { label: string; icon: JSX.Element }[] = [
        { label: 'All Pets', icon: <PetsIcon /> },
        { label: 'Dogs', icon: <DogIcon /> },
        { label: 'Cats', icon: <CatIcon /> },
        { label: 'Small Animals', icon: <SmallAnimalIcon /> },
    ];

    // Mapping of tab indices to species IDs
    const speciesIdMap: number[] = [0, 1, 2, 1003];

    // States for filters
    const [breed, setBreed] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState<string[]>([]); // Changed to array for multi-select
    const [stage, setStage] = useState(''); // New state for stage

    // State for sorting
    const [sortBy, setSortBy] = useState<string>(''); // '' means no sorting

    // State for pets data
    const [pets, setPets] = useState<AdoptableSearch[]>([]);

    // State for loading and error
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedAnimalID, setSelectedAnimalID] = useState<number | null>(null);
    const [modalData, setModalData] = useState<AdoptableDetails | null>(null);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const isMobile = useMediaQuery('(max-width:600px)');
    const itemsPerPage = isMobile ? 10 : 20; // Dynamically set items per page

    // Handler functions
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
        // Reset filters when tab changes (optional)
        setBreed('');
        setGender('');
        setAge([]);
        setStage('');
        setSortBy(''); // Reset sorting
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleBreedChange = (value: string | null) => {
        setBreed(value || '');
    };

    const handleGenderChange = (event: SelectChangeEvent<string>) => {
        setGender(event.target.value);
    };


    const handleAgeChange = (event: SelectChangeEvent<string | string[]>) => {
        const value = event.target.value;
        setAge(Array.isArray(value) ? value : [value]);
    };

    const handleStageChange = (event: SelectChangeEvent<string>) => {
        setStage(event.target.value);
    };

    const handleSortByChange = (event: SelectChangeEvent<string>) => {
        setSortBy(event.target.value);
    };

    // Handle Page Change
    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    // Effect to reset current page when filters, sorting, or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, breed, gender, age, stage, sortBy, selectedTab]);

    // Effect to make API request based on selectedTab
    useEffect(() => {
        const fetchPets = async () => {
            setLoading(true); // Start loading
            setError(null); // Reset previous errors
            try {
                const speciesID = speciesIdMap[selectedTab];
                const response = await fetch(
                    `https://jztmocmwmf.execute-api.us-east-2.amazonaws.com/Production/COMAPI?speciesID=${speciesID}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const xmlData = await response.text();
                const jsonObj = parser.parse(xmlData) as Root;

                // Access the ArrayOfXmlNode.XmlNode property with type guards
                let xmlNodes = jsonObj['ns0:ArrayOfXmlNode']?.['ns0:XmlNode'];

                if (!xmlNodes) {
                    return;
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
                setLoading(false); // End loading
            }
        };

        fetchPets();
    }, [selectedTab, parser]);

    // Function to open modal
    const openModal = (animalID: number) => {
        setSelectedAnimalID(animalID);
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAnimalID(null);
        setModalData(null);
        setModalError(null);
    };

    // Filter pets based on search and filters
    const filteredPets = pets.filter((pet) => {
        // Filter by tab
        if (speciesIdMap[selectedTab] !== 0) { // If not 'All Pets'
            if (speciesIdMap[selectedTab] === 1 && pet.Species !== 'Dog') return false;
            if (speciesIdMap[selectedTab] === 2 && pet.Species !== 'Cat') return false;
            if (speciesIdMap[selectedTab] === 1003 && pet.Species !== 'Small Animal') return false;
        }

        // Filter by search query (Name or Breed)
        if (
            searchQuery &&
            !pet.PrimaryBreed.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
            pet.Name &&
            !pet.Name.toString().toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
            return false;

        // Filter by breed
        if (breed && !pet.PrimaryBreed.toLowerCase().includes(breed.toLowerCase())) return false;

        // Filter by gender
        if (gender && pet.Sex !== gender) return false;

        // Filter by age (multi-select)
        if (age.length > 0 && !age.includes(Math.floor(pet.Age / 12).toString())) return false;

        // Filter by stage
        if (stage && pet.Stage !== stage) return false;

        return true;
    });

    // Apply sorting based on sortBy
    const sortedPets = [...filteredPets].sort((a, b) => {
        if (sortBy === 'breed') {
            return a.PrimaryBreed.localeCompare(b.PrimaryBreed);
        } else if (sortBy === 'age') {
            return a.Age - b.Age;
        }
        return 0; // No sorting
    });

    // Paginate the sorted pets
    const totalPages = Math.ceil(sortedPets.length / itemsPerPage);
    const paginatedPets = sortedPets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Extract unique breeds for the breed filter dropdown
    const uniqueBreedsSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.PrimaryBreed) {
            uniqueBreedsSet.add(pet.PrimaryBreed);
        }
    });
    const uniqueBreeds = Array.from(uniqueBreedsSet).sort();

    // Extract unique ages in years for the age filter dropdown
    const uniqueAgesSet = new Set<number>();
    pets.forEach((pet) => {
        if (pet.Age !== undefined && pet.Age !== null) {
            const ageInYears = Math.floor(pet.Age / 12);
            uniqueAgesSet.add(ageInYears);
        }
    });
    const uniqueAges = Array.from(uniqueAgesSet).sort((a, b) => a - b);

    // Extract unique stages for the stage filter dropdown
    const uniqueStagesSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.Stage) {
            uniqueStagesSet.add(pet.Stage);
        }
    });
    const uniqueStages = Array.from(uniqueStagesSet).sort();

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* AppBar with Tabs */}
            <Header selectedTab={selectedTab} onTabChange={handleTabChange} tabLabels={tabLabels} />

            {/* Main Content */}
            <Box sx={{ padding: 3, flexGrow: 1 }}>
                {/* Search and Filters */}
                <Filters
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    breed={breed}
                    onBreedChange={handleBreedChange}
                    uniqueBreeds={uniqueBreeds}
                    gender={gender}
                    onGenderChange={handleGenderChange}
                    uniqueAges={uniqueAges}
                    age={age}
                    onAgeChange={handleAgeChange}
                    stage={stage}
                    onStageChange={handleStageChange}
                    uniqueStages={uniqueStages}
                    sortBy={sortBy}
                    onSortByChange={handleSortByChange}
                />

                {/* Pet List */}
                <PetList pets={paginatedPets} loading={loading} error={error} onPetClick={openModal} />

                {/* Pagination Controls */}
                <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
            </Box>

            {/* Footer Disclaimer */}
            <Footer />

            {/* Modal for Pet Details */}
            <PetModal
                isOpen={isModalOpen}
                animalID={selectedAnimalID}
                onClose={closeModal}
                setModalData={setModalData}
                setModalError={setModalError}
                setModalLoading={setModalLoading}
                modalData={modalData}
                modalError={modalError}
                modalLoading={modalLoading}
            />
        </Box>
    );
}

export default App;