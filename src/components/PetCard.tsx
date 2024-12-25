// PetCard.tsx

import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea } from '@mui/material';
import { AdoptableSearch } from '../types';

interface PetCardProps {
    pet: AdoptableSearch;
    onClick: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick }) => {
    return (
        <Card>
            <CardActionArea onClick={onClick}>
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
                        <strong>Age:</strong> {Math.floor(pet.Age / 12)} Year{Math.floor(pet.Age / 12) !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Location:</strong> {pet.Location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Stage:</strong> {pet.Stage}
                    </Typography>
                    {/* Add more fields as needed */}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PetCard;