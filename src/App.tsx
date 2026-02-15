// src/App.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { XMLParser } from 'fast-xml-parser';
import {
    AdoptableDetails,
    AdoptableSearch,
    Root,
} from './types';
import {
    SelectChangeEvent,
    useMediaQuery,
    Box,
    Container,
    Paper,
    Stack,
    Typography,
    Chip,
} from '@mui/material';

// MUI Icons
import PetsIcon from '@mui/icons-material/Pets';
import DogIcon from '@mui/icons-material/EmojiNature'; // Replace with appropriate icons
import CatIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons
import SmallAnimalIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons
import StarIcon from '@mui/icons-material/Star';

// Custom Components
import Header from './components/Header';
import Filters from './components/Filters';
import PetList from './components/PetList';
import PetModal from './components/PetModal';
import Footer from './components/Footer';
import PaginationControls from './components/PaginationControls';
import DisclaimerDialog from './components/DisclaimerDialog';
import { useFavorites } from './hooks/useFavorites';
import { useSeenPets } from './hooks/useSeenPets';

const parser = new XMLParser();
const speciesIdMap: number[] = [0, 1, 2, 1003, -1];

const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

type AppUrlState = {
    selectedTab: number;
    searchQuery: string;
    breed: string[];
    gender: string;
    age: { min: string; max: string };
    stage: string;
    sortBy: string;
    hideSeen: boolean;
    currentPage: number;
};

const parseAgeFilterValue = (value: string | null) => {
    const trimmed = value?.trim() ?? '';
    return /^\d+$/.test(trimmed) ? trimmed : '';
};

const getUrlState = (): AppUrlState => {
    const searchParams = new URLSearchParams(window.location.search);
    const rawTab = Number(searchParams.get('tab'));
    const selectedTab = Number.isInteger(rawTab) && rawTab >= 0 && rawTab < speciesIdMap.length
        ? rawTab
        : 0;

    const rawPage = Number(searchParams.get('page'));
    const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawBreed = searchParams.get('breed') ?? '';
    const breed = rawBreed
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    const rawGender = searchParams.get('gender');
    const gender = rawGender === 'Male' || rawGender === 'Female' ? rawGender : '';

    const rawSortBy = searchParams.get('sort');
    const sortBy = rawSortBy === 'breed' || rawSortBy === 'age' ? rawSortBy : '';

    const rawHideSeen = searchParams.get('hideSeen');
    const hideSeen = rawHideSeen === 'true' || rawHideSeen === '1';

    return {
        selectedTab,
        searchQuery: searchParams.get('q')?.trim() ?? '',
        breed,
        gender,
        age: {
            min: parseAgeFilterValue(searchParams.get('ageMin')),
            max: parseAgeFilterValue(searchParams.get('ageMax')),
        },
        stage: searchParams.get('stage')?.trim() ?? '',
        sortBy,
        hideSeen,
        currentPage,
    };
};

const buildUrlSearchParams = (state: AppUrlState) => {
    const params = new URLSearchParams();

    if (state.selectedTab !== 0) {
        params.set('tab', String(state.selectedTab));
    }
    if (state.searchQuery) {
        params.set('q', state.searchQuery);
    }
    if (state.breed.length > 0) {
        params.set('breed', state.breed.join(','));
    }
    if (state.gender) {
        params.set('gender', state.gender);
    }
    if (state.age.min) {
        params.set('ageMin', state.age.min);
    }
    if (state.age.max) {
        params.set('ageMax', state.age.max);
    }
    if (state.stage) {
        params.set('stage', state.stage);
    }
    if (state.sortBy) {
        params.set('sort', state.sortBy);
    }
    if (state.hideSeen) {
        params.set('hideSeen', 'true');
    }
    if (state.currentPage > 1) {
        params.set('page', String(state.currentPage));
    }

    return params;
};

function App() {
    const initialUrlState = getUrlState();

    // State for search query
    const [searchQuery, setSearchQuery] = useState(initialUrlState.searchQuery);

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState<number>(initialUrlState.selectedTab);
    const tabLabels: { label: string; icon: JSX.Element }[] = [
        { label: 'All Pets', icon: <PetsIcon /> },
        { label: 'Dogs', icon: <DogIcon /> },
        { label: 'Cats', icon: <CatIcon /> },
        { label: 'Small Animals', icon: <SmallAnimalIcon /> },
        { label: 'Favorites', icon: <StarIcon /> },
    ];

    // States for filters
    const [breed, setBreed] = useState<string[]>(initialUrlState.breed); // Changed to array for multi-select
    const [gender, setGender] = useState(initialUrlState.gender);
    const [age, setAge] = useState<{ min: string; max: string }>(initialUrlState.age); // Changed to object for min/max
    const [stage, setStage] = useState(initialUrlState.stage); // New state for stage
    const [hideSeen, setHideSeen] = useState<boolean>(initialUrlState.hideSeen);

    // State for sorting
    const [sortBy, setSortBy] = useState<string>(initialUrlState.sortBy); // '' means no sorting

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
    const [currentPage, setCurrentPage] = useState<number>(initialUrlState.currentPage);
    const isMobile = useMediaQuery('(max-width:600px)');
    const itemsPerPage = isMobile ? 10 : 20; // Dynamically set items per page
    const skipPageReset = useRef(true);
    const isRestoringFromUrl = useRef(false);
    const petsTabRef = useRef<number>(initialUrlState.selectedTab);
    const isFetchingPets = useRef(false);

    // Favorites Hook
    const { favorites, toggleFavorite, isFavorite, isDisclaimerOpen, acceptDisclaimer, closeDisclaimer, checkAvailability } = useFavorites();

    // Seen Pets Hook
    const { seenPets, isSeenEnabled, toggleSeenFeature, markAsSeen, markAllAsSeen, isSeen } = useSeenPets();

    // Handler functions
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
        // Reset filters when tab changes (optional)
        setBreed([]);
        setGender('');
        setAge({ min: '', max: '' });
        setStage('');
        setSortBy(''); // Reset sorting
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleBreedChange = (_: React.SyntheticEvent<Element, Event>, value: string[]) => {
        setBreed(value);
    };

    const handleGenderChange = (event: SelectChangeEvent<string>) => {
        setGender(event.target.value);
    };


    const handleAgeChange = (type: 'min' | 'max', value: string) => {
        setAge((prev) => ({ ...prev, [type]: value }));
    };

    const handleStageChange = (event: SelectChangeEvent<string>) => {
        setStage(event.target.value);
    };

    const handleSortByChange = (event: SelectChangeEvent<string>) => {
        setSortBy(event.target.value);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setBreed([]);
        setGender('');
        setAge({ min: '', max: '' });
        setStage('');
        setSortBy('');
        setHideSeen(false);
    };

    // Handle Page Change
    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const syncStateFromUrl = useCallback(() => {
        const urlState = getUrlState();

        isRestoringFromUrl.current = true;
        skipPageReset.current = true;
        setSelectedTab(urlState.selectedTab);
        setSearchQuery(urlState.searchQuery);
        setBreed(urlState.breed);
        setGender(urlState.gender);
        setAge(urlState.age);
        setStage(urlState.stage);
        setSortBy(urlState.sortBy);
        setHideSeen(urlState.hideSeen);
        setCurrentPage(urlState.currentPage);
    }, []);

    const syncUrlFromState = useCallback(() => {
        const params = buildUrlSearchParams({
            selectedTab,
            searchQuery,
            breed,
            gender,
            age,
            stage,
            sortBy,
            hideSeen,
            currentPage,
        });
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
        window.history.replaceState(null, '', nextUrl);
    }, [age, breed, currentPage, gender, hideSeen, searchQuery, selectedTab, sortBy, stage]);

    // Effect to reset current page when filters, sorting, or tab changes
    useEffect(() => {
        if (skipPageReset.current) {
            skipPageReset.current = false;
            return;
        }
        if (isRestoringFromUrl.current) {
            isRestoringFromUrl.current = false;
            return;
        }

        setCurrentPage(1);
    }, [searchQuery, breed, gender, age, stage, sortBy, selectedTab]);

    useEffect(() => {
        syncUrlFromState();
    }, [syncUrlFromState]);

    useEffect(() => {
        const onPopState = () => {
            syncStateFromUrl();
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [syncStateFromUrl]);

    // Effect to make API request based on selectedTab
    useEffect(() => {
        if (selectedTab === 4) return;

        const fetchPets = async () => {
            isFetchingPets.current = true;
            petsTabRef.current = selectedTab;
            setLoading(true); // Start loading
            setError(null); // Reset previous errors
            setPets([]); // Clear pets
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
                let xmlNodes = jsonObj['ArrayOfXmlNode']?.['XmlNode'];

                if (!xmlNodes) {
                    setPets([]);
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
            } catch (err: unknown) {
                console.error('Error fetching pets:', err);
                setError(getErrorMessage(err, 'Failed to fetch pets.'));
            } finally {
                isFetchingPets.current = false;
                setLoading(false); // End loading
            }
        };

        fetchPets();
    }, [selectedTab]);

    // Effect to update pets when on Favorites tab
    useEffect(() => {
        if (selectedTab === 4) {
            petsTabRef.current = 4;
            setPets(favorites);
            setLoading(false);
        }
    }, [selectedTab, favorites]);

    // Check availability of favorites when pets list is updated
    useEffect(() => {
        // Don't check availability if we are viewing favorites (tab 4)
        if (selectedTab === 4) return;

        if (!loading && !error && pets.length > 0) {
            const currentSpecies = selectedTab === 0 ? 'All' :
                selectedTab === 1 ? 'Dog' :
                    selectedTab === 2 ? 'Cat' :
                        selectedTab === 3 ? 'Small Animal' : '';
            if (currentSpecies) {
                checkAvailability(pets, currentSpecies);
            }
        }
    }, [pets, loading, error, selectedTab, checkAvailability]);

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

        // Filter by breed (multi-select)
        if (breed.length > 0 && !breed.includes(pet.PrimaryBreed)) return false;

        // Filter by gender
        if (gender && pet.Sex !== gender) return false;

        // Filter by age (min/max)
        if (age.min && pet.Age < parseInt(age.min) * 12) return false;
        if (age.max && pet.Age > parseInt(age.max) * 12) return false;

        // Filter by stage
        if (stage && pet.Stage !== stage) return false;

        // Filter by seen status
        if (isSeenEnabled && hideSeen && isSeen(pet)) return false;

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

    useEffect(() => {
        if (loading) {
            return;
        }
        if (isFetchingPets.current) {
            return;
        }
        if (isRestoringFromUrl.current) {
            return;
        }
        if (petsTabRef.current !== selectedTab) {
            return;
        }
        if (pets.length === 0) {
            return;
        }

        const maxPage = Math.max(totalPages, 1);
        if (currentPage > maxPage) {
            setCurrentPage(maxPage);
        }
    }, [currentPage, loading, totalPages, pets.length, selectedTab]);

    // Extract unique breeds for the breed filter dropdown
    const uniqueBreedsSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.PrimaryBreed) {
            uniqueBreedsSet.add(pet.PrimaryBreed);
        }
    });
    const uniqueBreeds = Array.from(uniqueBreedsSet).sort();


    // Extract unique stages for the stage filter dropdown
    const uniqueStagesSet = new Set<string>();
    pets.forEach((pet) => {
        if (pet.Stage) {
            uniqueStagesSet.add(pet.Stage);
        }
    });
    const uniqueStages = Array.from(uniqueStagesSet).sort();
    const stageSelectValue = uniqueStages.length === 0 || !uniqueStages.includes(stage) ? '' : stage;

    useEffect(() => {
        if (stage && uniqueStages.length > 0 && !uniqueStages.includes(stage)) {
            setStage('');
        }
    }, [stage, uniqueStages]);

    const hasActiveFilters =
        searchQuery.trim().length > 0 ||
        breed.length > 0 ||
        Boolean(gender) ||
        Boolean(stage) ||
        Boolean(age.min) ||
        Boolean(age.max) ||
        Boolean(sortBy) ||
        hideSeen;

    return (
        <Box className="App" sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
                tabLabels={tabLabels}
                filteredCount={sortedPets.length}
                favoritesCount={favorites.length}
            />

            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, flexGrow: 1 }}>
                <Paper
                    sx={{
                        mb: 2.5,
                        p: { xs: 2, md: 2.5 },
                        background: 'linear-gradient(120deg, rgba(230, 244, 227, 0.95) 0%, rgba(255, 247, 230, 0.9) 100%)',
                        animation: 'fadeUp 300ms ease-out',
                    }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <Box>
                            <Typography variant="h6">
                                {tabLabels[selectedTab].label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tap a pet card to view full intake details and adoption links.
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip color="primary" label={`${sortedPets.length} results`} />
                            <Chip variant="outlined" label={`${favorites.length} favorited`} />
                            <Chip variant="outlined" label={`${seenPets.length} seen`} />
                        </Stack>
                    </Stack>
                </Paper>

                <Filters
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    breed={breed}
                    onBreedChange={handleBreedChange}
                    uniqueBreeds={uniqueBreeds}
                    gender={gender}
                    onGenderChange={handleGenderChange}
                    age={age}
                    onAgeChange={handleAgeChange}
                    stage={stageSelectValue}
                    onStageChange={handleStageChange}
                    uniqueStages={uniqueStages}
                    sortBy={sortBy}
                    onSortByChange={handleSortByChange}
                    isSeenEnabled={isSeenEnabled}
                    onToggleSeenFeature={toggleSeenFeature}
                    hideSeen={hideSeen}
                    onHideSeenChange={setHideSeen}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                />

                <PetList
                    pets={paginatedPets}
                    loading={loading}
                    error={error}
                    onPetClick={openModal}
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                    isSeenEnabled={isSeenEnabled}
                    markAsSeen={markAsSeen}
                    markAllAsSeen={markAllAsSeen}
                    isSeen={isSeen}
                />

                <PaginationControls totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
            </Container>

            <Footer />

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
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                isSeenEnabled={isSeenEnabled}
                markAsSeen={markAsSeen}
                isSeen={isSeen}
            />

            <DisclaimerDialog open={isDisclaimerOpen} onAccept={acceptDisclaimer} onClose={closeDisclaimer} />
        </Box>
    );
}

export default App;
