// App.tsx

import React, { useState, useEffect } from 'react';
import './App.css';
import { XMLParser } from 'fast-xml-parser';
import { AdoptableDetails, AdoptableDetailsXmlNode, AdoptableSearch, Root } from './types';
import { useMediaQuery } from '@mui/material';

// MUI Icons
import PetsIcon from '@mui/icons-material/Pets';
import DogIcon from '@mui/icons-material/EmojiNature'; // Replace with appropriate icons
import CatIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons
import SmallAnimalIcon from '@mui/icons-material/Pets'; // Replace with appropriate icons

// MUI Components
import {
    Box,
    SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Typography,
    Link,
    Grid,
    Pagination, // Imported Pagination component
} from '@mui/material';

// Custom Components
import Header from './components/Header';
import Filters from './components/Filters';
import PetList from './components/PetList';

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

    // **Updated HandleBreedChange**
    /**
     * Updated to handle the new signature from the Autocomplete component.
     * It now accepts a string or null value instead of an event.
     */
    const handleBreedChange = (value: string | null) => {
        setBreed(value || '');
    };

    const handleGenderChange = (event: SelectChangeEvent<string>) => {
        setGender(event.target.value);
    };

    const handleAgeChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        setAge(typeof value === 'string' ? value.split(',') : value);
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
    }, [selectedTab]); // Dependency on selectedTab ensures fetch on tab change

    // Function to open modal and fetch detailed data
    const openModal = async (animalID: number) => {
        setIsModalOpen(true);
        setModalLoading(true);
        setModalError(null);
        try {
            const response = await fetch(
                `https://jztmocmwmf.execute-api.us-east-2.amazonaws.com/Production/COMAPI?animalID=${animalID}`
            );

            const data = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const xmlData = await parser.parse(data) as AdoptableDetailsXmlNode;
            console.log(xmlData.adoptableDetails);
            setModalData(xmlData.adoptableDetails);
        } catch (err: any) {
            console.error('Error fetching detailed pet data:', err);
            setModalError(err.message || 'Failed to fetch detailed pet data.');
        } finally {
            setModalLoading(false);
        }
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
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
        <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh' }}>
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
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            siblingCount={1}
                            boundaryCount={1}
                        />
                    </Box>
                )}
            </Box>

            {/* Footer Disclaimer */}
            <Box
                id="disclaimer"
                component="footer"
                sx={{
                    backgroundColor: 'grey.200',
                    padding: 2,
                    textAlign: 'center',
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    Disclaimer: The information provided on this website is for informational purposes only. We are not affiliated with or endorsed by the City of Midland, nor are we attempting to impersonate them. While we strive to keep the information accurate and up to date, we make no representations or warranties of any kind, express or implied, about the accuracy, reliability, or completeness of the information. We are not liable for any inaccuracies, lost time, or other consequences arising from reliance on this information. For official and up-to-date details, please refer to the City of Midland's Animals Currently in the Shelter webpage:
                    <Link href="https://www.midlandtexas.gov/1030/Animals-currently-in-the-Shelter" target="_blank" rel="noopener">
                        https://www.midlandtexas.gov/1030/Animals-currently-in-the-Shelter
                    </Link>.
                </Typography>
            </Box>

            {/* Modal for Pet Details */}
            <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
                <DialogTitle>Pet Details</DialogTitle>
                <DialogContent>
                    {modalLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : modalError ? (
                        <DialogContentText color="error">
                            {modalError}
                        </DialogContentText>
                    ) : modalData ? (
                        <Box>
                            {/* Photo Carousel */}
                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    {[modalData.Photo1, modalData.Photo2, modalData.Photo3]
                                        .filter(Boolean) // Filter out any null or undefined photos
                                        .map((photo, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <img
                                                    key={index}
                                                    src={photo || ''}
                                                    alt={`Photo ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '300px',
                                                        height: 'auto',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>

                            {/* Basic Information */}
                            <Typography gutterBottom variant="h5" component="div" sx={{ marginTop: 2 }}>
                                {modalData.AnimalName}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Species:</strong> {modalData.Species}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Breed:</strong> {modalData.PrimaryBreed}
                                {modalData.SecondaryBreed && ` (${modalData.SecondaryBreed})`}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Gender:</strong> {modalData.Sex}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Age:</strong> {Math.floor(modalData.Age / 12)} Year{Math.floor(modalData.Age / 12) !== 1 ? 's' : ''}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Location:</strong> {modalData.Location}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Stage:</strong> {modalData.Stage}
                            </Typography>

                            {/* Additional Information */}
                            <Box sx={{ marginTop: 2 }}>
                                {modalData.SpecialNeeds && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Special Needs:</strong> {modalData.SpecialNeeds}
                                    </Typography>
                                )}
                                {modalData.BehaviorResult && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Behavior:</strong> {modalData.BehaviorResult}
                                    </Typography>
                                )}
                                {modalData.ReasonForSurrender && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Reason for Surrender:</strong> {modalData.ReasonForSurrender}
                                    </Typography>
                                )}
                                {modalData.DateOfSurrender && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Date of Surrender:</strong> {new Date(modalData.DateOfSurrender).toLocaleDateString()}
                                    </Typography>
                                )}
                                {modalData.PrevEnvironment && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Previous Environment:</strong> {modalData.PrevEnvironment}
                                    </Typography>
                                )}
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Lived with Children:</strong> {modalData.LivedWithChildren}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Lived with Other Animals:</strong> {modalData.LivedWithAnimals}
                                    {modalData.LivedWithAnimalTypes && ` (${modalData.LivedWithAnimalTypes})`}
                                </Typography>
                                {modalData.Altered && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Altered:</strong> {modalData.Altered}
                                    </Typography>
                                )}
                                {modalData.Declawed && modalData.Species.toLowerCase() === 'cat' && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Declawed:</strong> {modalData.Declawed}
                                    </Typography>
                                )}
                                {modalData.ChipNumber && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Chip Number:</strong> {modalData.ChipNumber}
                                    </Typography>
                                )}
                                {modalData.VideoID && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Video:</strong>{' '}
                                        <Link href={`https://videos.example.com/${modalData.VideoID}`} target="_blank" rel="noopener">
                                            Watch Video
                                        </Link>
                                    </Typography>
                                )}
                                {modalData.Dsc && (
                                    <Typography variant="body1" color="text.secondary">
                                        <strong>Description:</strong> {modalData.Dsc}
                                    </Typography>
                                )}
                            </Box>

                            {/* Adoption Link */}
                            {modalData.AdoptionApplicationUrl && (
                                <Box sx={{ marginTop: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        href={modalData.AdoptionApplicationUrl}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        Start Adoption Application
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <DialogContentText>No data available.</DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
}

export default App;