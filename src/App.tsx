// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import { XMLParser } from 'fast-xml-parser';
import { AdoptableSearch, Root } from './types';

// MUI Components
import {
    AppBar,
    Tabs,
    Tab,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Toolbar,
    SelectChangeEvent,
} from '@mui/material';

function App() {
    // State for search query
    const [searchQuery, setSearchQuery] = useState('');
    const parser = new XMLParser();

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const tabLabels: ('All Pets' | 'Dogs' | 'Cats' | 'Small Animals')[] = [
        'All Pets',
        'Dogs',
        'Cats',
        'Small Animals',
    ];

    // Mapping of tab indices to species IDs
    const speciesIdMap: number[] = [0, 1, 2, 1003];

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
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
        // Reset filters when tab changes (optional)
        setBreed('');
        setGender('');
        setAge('');
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleBreedChange = (event: SelectChangeEvent<string>) => {
        setBreed(event.target.value);
    };

    const handleGenderChange = (event: SelectChangeEvent<string>) => {
        setGender(event.target.value);
    };

    const handleAgeChange = (event: SelectChangeEvent<string>) => {
        setAge(event.target.value);
    };

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
                setLoading(false); // End loading
            }
        };

        fetchPets();
    }, [selectedTab]); // Dependency on selectedTab ensures fetch on tab change

    // Filter pets based on search and filters
    const filteredPets = pets.filter((pet) => {
        // Filter by tab
        if (speciesIdMap[selectedTab] !== 0) { // If not 'All Pets'
            if (speciesIdMap[selectedTab] === 1 && pet.Species !== 'Dog') return false;
            if (speciesIdMap[selectedTab] === 2 && pet.Species !== 'Cat') return false;
            if (speciesIdMap[selectedTab] === 1003 && pet.Species !== 'Small Animal') return false;
        }

        // Filter by search query
        if (searchQuery && !pet.PrimaryBreed.toLowerCase().includes(searchQuery.toLowerCase()))
            return false;

        // Filter by breed
        if (breed && !pet.PrimaryBreed.toLowerCase().includes(breed.toLowerCase())) return false;

        // Filter by gender
        if (gender && pet.Sex !== gender) return false;

        // Filter by age
        if (age && pet.Age.toString() !== age) return false;

        return true;
    });

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
        <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh' }}>
            {/* AppBar with Tabs */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        🐾 Adoptable Pets
                    </Typography>
                </Toolbar>
                <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    {tabLabels.map((label) => (
                        <Tab key={label} label={label} />
                    ))}
                </Tabs>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ padding: 3 }}>
                {/* Search and Filters */}
                <Grid container spacing={3} alignItems="center" sx={{ marginBottom: 3 }}>
                    {/* Search Bar */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Search by Breed"
                            variant="outlined"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="e.g., Labrador"
                        />
                    </Grid>

                    {/* Breed Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="breed-label">Breed</InputLabel>
                            <Select
                                labelId="breed-label"
                                value={breed}
                                onChange={handleBreedChange}
                                label="Breed"
                            >
                                <MenuItem value="">
                                    <em>All Breeds</em>
                                </MenuItem>
                                {uniqueBreeds.map((breedOption) => (
                                    <MenuItem key={breedOption} value={breedOption}>
                                        {breedOption}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Gender Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select
                                labelId="gender-label"
                                value={gender}
                                onChange={handleGenderChange}
                                label="Gender"
                            >
                                <MenuItem value="">
                                    <em>All Genders</em>
                                </MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Age Filter */}
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="age-label">Age</InputLabel>
                            <Select
                                labelId="age-label"
                                value={age}
                                onChange={handleAgeChange}
                                label="Age"
                            >
                                <MenuItem value="">
                                    <em>All Ages</em>
                                </MenuItem>
                                {uniqueAges.map((ageOption) => (
                                    <MenuItem key={ageOption} value={ageOption}>
                                        {ageOption} Year{ageOption !== 1 ? 's' : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Display Loading, Error, or Pet List */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        {filteredPets.length > 0 ? (
                            <Grid container spacing={4}>
                                {filteredPets.map((pet) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={pet.ID}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={pet.Photo || '/placeholder.png'}
                                                alt={pet.Name}
                                                onError={(e: any) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                            />
                                            <CardContent>
                                                <Typography gutterBottom variant="h6" component="div">
                                                    {pet.Name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Species:</strong> {pet.Species}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Breed:</strong> {pet.PrimaryBreed}
                                                    {pet.SecondaryBreed && ` (${pet.SecondaryBreed})`}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Gender:</strong> {pet.Sex}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Age:</strong> {pet.Age} Year{pet.Age !== 1 ? 's' : ''}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Location:</strong> {pet.Location}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Stage:</strong> {pet.Stage}
                                                </Typography>
                                                {/* Add more fields as needed */}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">No pets found matching your criteria.</Alert>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}

export default App;