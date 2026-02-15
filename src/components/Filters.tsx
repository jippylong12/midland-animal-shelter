import React from 'react';
import {
    Grid,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Box,
    Autocomplete,
    InputLabel,
    Switch,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Paper,
    Stack,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

interface FiltersProps {
    searchQuery: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    breed: string[];
    onBreedChange: (event: React.SyntheticEvent<Element, Event>, value: string[]) => void;
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
    hasActiveFilters: boolean;
    onClearFilters: () => void;
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
    hasActiveFilters,
    onClearFilters,
}) => {
    const [openDisclaimer, setOpenDisclaimer] = React.useState(false);

    return (
        <Paper sx={{ mb: 3, p: { xs: 2, md: 3 }, backdropFilter: 'blur(6px)', bgcolor: 'rgba(255,255,255,0.9)' }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={1}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h6">Find the right pet faster</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Combine filters to narrow results, then open a card for full details.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters}
                >
                    Clear Filters
                </Button>
            </Stack>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Search by name or breed"
                        variant="outlined"
                        value={searchQuery}
                        onChange={onSearchChange}
                        placeholder="e.g., Bella or Labrador"
                    />
                </Grid>

                <Grid item xs={12} md={4}>
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
                                    placeholder="Select one or more"
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option === value}
                        />
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            labelId="gender-label"
                            value={gender}
                            onChange={onGenderChange}
                            label="Gender"
                        >
                            <MenuItem value="">
                                <em>All genders</em>
                            </MenuItem>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="stage-label">Stage</InputLabel>
                        <Select
                            labelId="stage-label"
                            value={stage}
                            onChange={onStageChange}
                            label="Stage"
                        >
                            <MenuItem value="">
                                <em>All stages</em>
                            </MenuItem>
                            {uniqueStages.map((stageOption) => (
                                <MenuItem key={stageOption} value={stageOption}>
                                    {stageOption}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            label="Min age (yrs)"
                            type="number"
                            value={age.min}
                            onChange={(e) => onAgeChange('min', e.target.value)}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            label="Max age (yrs)"
                            type="number"
                            value={age.max}
                            onChange={(e) => onAgeChange('max', e.target.value)}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="sort-label">Sort by</InputLabel>
                        <Select
                            labelId="sort-label"
                            value={sortBy}
                            onChange={onSortByChange}
                            label="Sort by"
                        >
                            <MenuItem value="">
                                <em>Newest default</em>
                            </MenuItem>
                            <MenuItem value="breed">Breed (A-Z)</MenuItem>
                            <MenuItem value="age">Age (youngest)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
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
                            label="Remember seen pets"
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
                                label="Hide seen pets"
                            />
                        )}
                    </Stack>
                </Grid>
            </Grid>

            <Dialog open={openDisclaimer} onClose={() => setOpenDisclaimer(false)}>
                <DialogTitle>Enable seen history?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This stores viewed pets in your browser so you can hide pets you already checked.
                        It stays on this device only.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDisclaimer(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onToggleSeenFeature();
                            setOpenDisclaimer(false);
                        }}
                        color="primary"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default Filters;
