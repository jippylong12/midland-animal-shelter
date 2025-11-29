import React from 'react';
import { Grid, TextField, FormControl, Select, MenuItem, Box, Autocomplete, InputLabel, Switch, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

interface FiltersProps {
    searchQuery: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    breed: string[];
    onBreedChange: (event: any, value: string[]) => void;
    uniqueBreeds: string[];
    gender: string;
    onGenderChange: (event: SelectChangeEvent<string>) => void;
    age: { min: string; max: string };
    onAgeChange: (type: 'min' | 'max', value: string) => void;
    stage: string;
    onStageChange: (event: SelectChangeEvent<string>) => void;
    uniqueStages: string[];
    sortBy: string;
    onSortByChange: (event: SelectChangeEvent<string>) => void;
    isSeenEnabled: boolean;
    onToggleSeenFeature: () => void;
    hideSeen: boolean;
    onHideSeenChange: (value: boolean) => void;
}

const Filters: React.FC<FiltersProps> = ({
    searchQuery,
    onSearchChange,
    breed,
    onBreedChange,
    uniqueBreeds,
    gender,
    onGenderChange,
    age,
    onAgeChange,
    stage,
    onStageChange,
    uniqueStages,
    sortBy,
    onSortByChange,
    isSeenEnabled,
    onToggleSeenFeature,
    hideSeen,
    onHideSeenChange,
}) => {
    const [openDisclaimer, setOpenDisclaimer] = React.useState(false);

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

            {/* Breed Filter as Autocomplete */}
            <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined">
                    <Autocomplete
                        multiple
                        options={uniqueBreeds}
                        value={breed}
                        onChange={onBreedChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Breed"
                                placeholder="Select Breeds"
                            />
                        )}
                        // Allow clearing the selection to show "All Breeds"
                        isOptionEqualToValue={(option, value) => option === value}
                    />
                </FormControl>
            </Grid>

            {/* Age Filter (Min/Max) */}
            <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        label="Min Age"
                        type="number"
                        value={age.min}
                        onChange={(e) => onAgeChange('min', e.target.value)}
                        fullWidth
                        inputProps={{ min: 0 }}
                    />
                    <TextField
                        label="Max Age"
                        type="number"
                        value={age.max}
                        onChange={(e) => onAgeChange('max', e.target.value)}
                        fullWidth
                        inputProps={{ min: 0 }}
                    />
                </Box>
            </Grid>

            {/* Gender Filter */}
            <Grid item xs={4} md={1}>
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

            {/* Stage Filter */}
            <Grid item xs={4} md={1}>
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
            <Grid item xs={4} md={1}>
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

            {/* Seen Feature Toggle */}
            <Grid item xs={12} md={2}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isSeenEnabled}
                            onChange={() => {
                                if (!isSeenEnabled) {
                                    setOpenDisclaimer(true);
                                } else {
                                    onToggleSeenFeature();
                                }
                            }}
                            color="primary"
                        />
                    }
                    label="Enable Seen History"
                />
                {isSeenEnabled && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={hideSeen}
                                onChange={(e) => onHideSeenChange(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Hide Seen"
                    />
                )}
            </Grid>

            {/* Disclaimer Dialog */}
            <Dialog
                open={openDisclaimer}
                onClose={() => setOpenDisclaimer(false)}
            >
                <DialogTitle>Enable Seen History?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enabling this feature will store your viewed pets in your browser's local storage indefinitely.
                        This data is not shared with anyone else. Do you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDisclaimer(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        onToggleSeenFeature();
                        setOpenDisclaimer(false);
                    }} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default Filters;