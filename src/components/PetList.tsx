// PetList.tsx

import React from 'react';
import { AdoptableSearch } from '../types';
import { Grid, Typography, CircularProgress, Box, Button } from '@mui/material';
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
}

const PetList: React.FC<PetListProps> = ({ pets, loading, error, onPetClick, isFavorite, toggleFavorite, isSeenEnabled, markAsSeen, markAllAsSeen, isSeen }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="h6" align="center">
                {error}
            </Typography>
        );
    }

    if (pets.length === 0) {
        return (
            <Typography variant="h6" align="center">
                No pets found.
            </Typography>
        );
    }

    return (
        <Box>
            {isSeenEnabled && pets.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="outlined" onClick={() => markAllAsSeen(pets)}>
                        Mark All as Seen
                    </Button>
                </Box>
            )}
            <Grid container spacing={2}>
                {pets.map((pet, index) => (
                    <Grid
                        item
                        xs={12} sm={6} md={4} lg={3}
                        key={pet.ID}
                        sx={{
                            animation: 'fadeUp 0.5s ease-out forwards',
                            animationDelay: `${index * 0.05}s`,
                            opacity: 0, // Start invisible
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
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PetList;