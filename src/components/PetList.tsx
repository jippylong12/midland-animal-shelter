// PetList.tsx

import React from 'react';
import { AdoptableSearch } from '../types';
import { Grid, Typography, CircularProgress, Box, Button, Paper, Stack } from '@mui/material';
import PetCard from './PetCard';

interface PetListProps {
    pets: AdoptableSearch[];
    loading: boolean;
    error: string | null;
    onPetClick: (animalID: number) => void;
    isFavorite: (petID: number) => boolean;
    toggleFavorite: (pet: AdoptableSearch) => void;
    isSeenEnabled: boolean;
    markAsSeen: (pet: AdoptableSearch) => void;
    markAllAsSeen: (pets: AdoptableSearch[]) => void;
    isSeen: (pet: AdoptableSearch) => boolean;
    isNewMatch: (pet: AdoptableSearch) => boolean;
    isInCompare: (pet: AdoptableSearch) => boolean;
    isCompareLimitReached: boolean;
    onToggleCompare: (pet: AdoptableSearch) => void;
    getPetFitScore?: (pet: AdoptableSearch) => number | null;
    compactView?: boolean;
}

const PetList: React.FC<PetListProps> = ({
    pets,
    loading,
    error,
    onPetClick,
    isFavorite,
    toggleFavorite,
    isSeenEnabled,
    markAsSeen,
    markAllAsSeen,
    isSeen,
    isNewMatch,
    isInCompare,
    isCompareLimitReached,
    onToggleCompare,
    getPetFitScore,
    compactView = false,
}) => {
    const listSpacing = compactView ? 1.5 : 2.5;
    const compactGridCols = compactView ? 2 : 3;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={34} />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" variant="h6" align="center">
                    {error}
                </Typography>
            </Paper>
        );
    }

    if (pets.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" align="center">
                    No pets matched these filters.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try widening age, breed, or stage to see more pets.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                    Showing {pets.length} pet{pets.length === 1 ? '' : 's'} on this page
                </Typography>
                {isSeenEnabled && pets.length > 0 && (
                    <Button variant="outlined" onClick={() => markAllAsSeen(pets)}>
                        Mark page as seen
                    </Button>
                )}
            </Stack>
            <Grid container spacing={listSpacing}>
                {pets.map((pet, index) => (
                    <Grid
                        item
                        xs={12} sm={6} md={4} lg={compactGridCols}
                        key={pet.ID}
                        sx={{
                            animation: 'fadeUp 0.5s ease-out forwards',
                            animationDelay: `${index * 0.05}s`,
                            opacity: 0,
                        }}
                    >
                        <PetCard
                            pet={pet}
                            onClick={() => onPetClick(pet.ID)}
                            isFavorite={isFavorite(pet.ID)}
                            onToggleFavorite={() => toggleFavorite(pet)}
                            isSeenEnabled={isSeenEnabled}
                            onMarkAsSeen={() => markAsSeen(pet)}
                            isSeen={isSeen(pet)}
                            isNewMatch={isNewMatch(pet)}
                            isInCompare={isInCompare(pet)}
                            isCompareLimitReached={isCompareLimitReached}
                            onToggleCompare={() => onToggleCompare(pet)}
                            compactView={compactView}
                            matchScore={getPetFitScore ? getPetFitScore(pet) : null}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PetList;
