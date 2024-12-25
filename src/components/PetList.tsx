import React from 'react';
import { Grid, Box, CircularProgress, Alert } from '@mui/material';
import PetCard from './PetCard';
import { AdoptableSearch } from '../types';

interface PetListProps {
    pets: AdoptableSearch[];
    loading: boolean;
    error: string | null;
}

const PetList: React.FC<PetListProps> = ({ pets, loading, error }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (pets.length === 0) {
        return <Alert severity="info">No pets found matching your criteria.</Alert>;
    }

    return (
        <Grid container spacing={4}>
            {pets.map((pet) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={pet.ID}>
                    <PetCard pet={pet} />
                </Grid>
            ))}
        </Grid>
    );
};

export default PetList;