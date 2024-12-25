import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip, Box } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

interface FiltersProps {
    searchQuery: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    breed: string;
    onBreedChange: (event: SelectChangeEvent<string>) => void;
    uniqueBreeds: string[];
    gender: string;
    onGenderChange: (event: SelectChangeEvent<string>) => void;
    uniqueAges: number[];
    age: string[];
    onAgeChange: (event: SelectChangeEvent<string[]>) => void;
    stage: string;
    onStageChange: (event: SelectChangeEvent<string>) => void;
    uniqueStages: string[];
    sortBy: string;
    onSortByChange: (event: SelectChangeEvent<string>) => void;
}

const Filters: React.FC<FiltersProps> = ({
                                             searchQuery,
                                             onSearchChange,
                                             breed,
                                             onBreedChange,
                                             uniqueBreeds,
                                             gender,
                                             onGenderChange,
                                             uniqueAges,
                                             age,
                                             onAgeChange,
                                             stage,
                                             onStageChange,
                                             uniqueStages,
                                             sortBy,
                                             onSortByChange,
                                         }) => {
    return (
        <Grid container spacing={3} alignItems="center" sx={{ marginBottom: 3 }}>
            {/* Search Bar */}
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Search by Name or Breed"
                    variant="outlined"
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="e.g., Bella or Labrador"
                />
            </Grid>

            {/* Breed Filter */}
            <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="breed-label">Breed</InputLabel>
                    <Select
                        labelId="breed-label"
                        value={breed}
                        onChange={onBreedChange}
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
            <Grid item xs={12} sm={6} md={1}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                        labelId="gender-label"
                        value={gender}
                        onChange={onGenderChange}
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

            {/* Age Filter (Multi-Select) */}
            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="age-label">Age</InputLabel>
                    <Select
                        labelId="age-label"
                        multiple
                        value={age}
                        onChange={onAgeChange}
                        input={<OutlinedInput label="Age" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={`${value} Year${value !== '1' ? 's' : ''}`} />
                                ))}
                            </Box>
                        )}
                    >
                        <MenuItem value="">
                            <em>All Ages</em>
                        </MenuItem>
                        {uniqueAges.map((ageOption) => (
                            <MenuItem key={ageOption} value={ageOption.toString()}>
                                {ageOption} Year{ageOption !== 1 ? 's' : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Stage Filter */}
            <Grid item xs={12} sm={6} md={1}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="stage-label">Stage</InputLabel>
                    <Select
                        labelId="stage-label"
                        value={stage}
                        onChange={onStageChange}
                        label="Stage"
                    >
                        <MenuItem value="">
                            <em>All Stages</em>
                        </MenuItem>
                        {uniqueStages.map((stageOption) => (
                            <MenuItem key={stageOption} value={stageOption}>
                                {stageOption}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Sort By Dropdown */}
            <Grid item xs={12} sm={6} md={1}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="sort-label">Sort By</InputLabel>
                    <Select
                        labelId="sort-label"
                        value={sortBy}
                        onChange={onSortByChange}
                        label="Sort By"
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value="breed">Breed</MenuItem>
                        <MenuItem value="age">Age</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default Filters;