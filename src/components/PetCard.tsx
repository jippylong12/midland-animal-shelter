// PetCard.tsx

import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea, Chip, Box } from '@mui/material';
import { AdoptableSearch } from '../types';
interface PetCardProps {
    pet: AdoptableSearch;
    onClick: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick }) => {

    const formatAge = (age: number): string => {
        if (age < 12) {
            return `${age} Month${age !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(age / 12);
        const months = age % 12;
        return `${years} Year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} Month${months !== 1 ? 's' : ''}` : ''}`;
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={onClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <CardMedia
                    component="img"
                    height="240"
                    image={pet.Photo || '/placeholder.png'}
                    alt={pet.Name}
                    onError={(e: any) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                    sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ width: '100%', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0 }}>
                            {pet.Name}
                        </Typography>
                        <Chip
                            label={pet.Sex}
                            size="small"
                            sx={{
                                bgcolor: pet.Sex === 'Male' ? '#2196f3' : pet.Sex === 'Female' ? '#f48fb1' : undefined,
                                color: (pet.Sex === 'Male' || pet.Sex === 'Female') ? 'white' : 'text.primary',
                                borderColor: 'transparent'
                            }}
                            variant="filled"
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                        {pet.PrimaryBreed}
                        {pet.SecondaryBreed && ` • ${pet.SecondaryBreed}`}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                        <Chip label={formatAge(pet.Age)} size="small" />
                        <Chip label={pet.Location} size="small" variant="outlined" />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PetCard;