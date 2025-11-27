// PetList.tsx

import React from 'react';
import { AdoptableSearch } from '../types';
import { Grid, Typography, CircularProgress, Box } from '@mui/material';
import PetCard from './PetCard';

interface PetListProps {
    pets: AdoptableSearch[];
    loading: boolean;
    error: string | null;
    onPetClick: (animalID: number) => void;
}

const PetList: React.FC<PetListProps> = ({ pets, loading, error, onPetClick }) => {
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
                    <PetCard pet={pet} onClick={() => onPetClick(pet.ID)} />
                </Grid>
            ))}
        </Grid>
    );
};

export default PetList;