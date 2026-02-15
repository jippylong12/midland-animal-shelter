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
    IconButton,
    Collapse,
    Divider,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { SearchPreset } from '../utils/searchPresets';

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
    isPersonalFitEnabled: boolean;
    isSeenEnabled: boolean;
    onToggleSeenFeature: () => void;
    hideSeen: boolean;
    onHideSeenChange: (value: boolean) => void;
    savedSearchPresets: SearchPreset[];
    onSaveSearchPreset: (presetName: string) => void;
    onApplySearchPreset: (presetId: string) => void;
    onDeleteSearchPreset: (presetId: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    newMatchCount: number;
    hasNewMatchHistory: boolean;
    onClearCurrentTabNewMatches: () => void;
    onClearAllNewMatches: () => void;
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
    isPersonalFitEnabled,
    isSeenEnabled,
    onToggleSeenFeature,
    hideSeen,
    onHideSeenChange,
    savedSearchPresets,
    onSaveSearchPreset,
    onApplySearchPreset,
    onDeleteSearchPreset,
    hasActiveFilters,
    onClearFilters,
    newMatchCount,
    hasNewMatchHistory,
    onClearCurrentTabNewMatches,
    onClearAllNewMatches,
}) => {
    const [openDisclaimer, setOpenDisclaimer] = React.useState(false);
    const [searchPresetName, setSearchPresetName] = React.useState('');
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    const canSaveSearchPreset = searchPresetName.trim().length > 0;

    const handleSavePreset = () => {
        if (!canSaveSearchPreset) return;
        onSaveSearchPreset(searchPresetName);
        setSearchPresetName('');
    };

    return (
        <Paper sx={{ mb: 3, p: { xs: 2, md: 3 }, backdropFilter: 'blur(6px)', bgcolor: 'rgba(255,255,255,0.9)' }}>
            <Stack direction="column" spacing={2}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={1}
                >
                    <Box>
                        <Typography variant="h6">Find the right pet faster</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Use quick filters first, then open advanced controls for sorting, presets, and history tools.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Button
                            variant="outlined"
                            onClick={onClearFilters}
                            disabled={!hasActiveFilters}
                        >
                            Clear Filters
                        </Button>
                        <Button
                            variant={showAdvanced ? 'contained' : 'outlined'}
                            onClick={() => setShowAdvanced((prev) => !prev)}
                        >
                            {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                        </Button>
                    </Stack>
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
                </Grid>

                <Collapse in={showAdvanced}>
                    <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
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

                            <Grid item xs={12} sm={6} md={3}>
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
                                    <MenuItem value="score" disabled={!isPersonalFitEnabled}>
                                        Personal fit score {!isPersonalFitEnabled ? '(enable first)' : ''}
                                    </MenuItem>
                                </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={5}>
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

                        <Divider />

                        <Stack spacing={1.2}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                spacing={1}
                            >
                                <Typography variant="subtitle1">Search Presets</Typography>
                                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                                    <TextField
                                        size="small"
                                        label="Preset name"
                                        value={searchPresetName}
                                        onChange={(event) => setSearchPresetName(event.target.value)}
                                        placeholder="Name this preset"
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={handleSavePreset}
                                        disabled={!canSaveSearchPreset}
                                    >
                                        Save Search Preset
                                    </Button>
                                </Stack>
                            </Stack>

                            <Box>
                                {savedSearchPresets.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No saved search presets yet.
                                    </Typography>
                                ) : (
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {savedSearchPresets.map((preset) => (
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={0.3}
                                                key={preset.id}
                                                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 0.3 }}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => onApplySearchPreset(preset.id)}
                                                >
                                                    {preset.name}
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => onDeleteSearchPreset(preset.id)}
                                                    aria-label={`Delete preset ${preset.name}`}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Stack>

                        <Divider />

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            spacing={1}
                        >
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={onClearCurrentTabNewMatches}
                                disabled={newMatchCount === 0}
                            >
                                Clear New Matches{newMatchCount > 0 ? ` (${newMatchCount})` : ''}
                            </Button>
                            <Button
                                variant="text"
                                onClick={onClearAllNewMatches}
                                disabled={!hasNewMatchHistory}
                            >
                                Clear All New-Match History
                            </Button>
                        </Stack>
                    </Stack>
                </Collapse>
            </Stack>

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
