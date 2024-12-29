// PetCard.tsx

import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea } from '@mui/material';
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
        <Card>
            <CardActionArea onClick={onClick}>
                <CardMedia
                    component="img"
                    height="300"
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
                        <strong>Age:</strong> {formatAge(pet.Age)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Location:</strong> {pet.Location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Stage:</strong> {pet.Stage}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PetCard;