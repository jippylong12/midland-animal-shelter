import React from 'react';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AdoptableSearch } from '../types';
import { OFFLINE_IMAGE_FALLBACK } from '../utils/imageFallback';

interface CompareTrayProps {
    comparePets: AdoptableSearch[];
    onOpenPet: (animalID: number) => void;
    onRemovePet: (pet: AdoptableSearch) => void;
    onClearAll: () => void;
    isFavorite: (petID: number) => boolean;
    isSeen: (pet: AdoptableSearch) => boolean;
    isCompareLimitReached: boolean;
}

const formatAge = (age: number): string => {
    if (age < 12) {
        return `${age} Month${age !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(age / 12);
    const months = age % 12;
    return `${years} Year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} Month${months !== 1 ? 's' : ''}` : ''}`;
};

const CompareTray: React.FC<CompareTrayProps> = ({
    comparePets,
    onOpenPet,
    onRemovePet,
    onClearAll,
    isFavorite,
    isSeen,
    isCompareLimitReached,
}) => {
    return (
        <Paper
            role="region"
            aria-label="Compare tray"
            sx={{
                mt: 2.5,
                p: 2,
                background: 'linear-gradient(120deg, rgba(230, 244, 227, 0.96) 0%, rgba(255, 247, 230, 0.95) 100%)',
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    Compare Tray ({comparePets.length}/3)
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    {isCompareLimitReached && (
                        <Typography variant="body2" color="warning.main">
                            Limit reached. Remove one to add another.
                        </Typography>
                    )}
                    <Button variant="outlined" size="small" onClick={onClearAll}>
                        Clear All
                    </Button>
                </Stack>
            </Stack>
            <Grid container spacing={2}>
                {comparePets.map((pet) => {
                    const compareKey = `${pet.Species}-${pet.ID}`;
                    return (
                        <Grid key={compareKey} item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={pet.Photo || OFFLINE_IMAGE_FALLBACK}
                                    alt={pet.Name}
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = OFFLINE_IMAGE_FALLBACK;
                                    }}
                                />
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {pet.Name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {pet.Species} • {pet.PrimaryBreed}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatAge(pet.Age)} • {pet.Sex}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {isFavorite(pet.ID) && (
                                                <Chip
                                                    size="small"
                                                    icon={<StarIcon fontSize="small" />}
                                                    label="Favorite"
                                                    color="secondary"
                                                />
                                            )}
                                            {isSeen(pet) && (
                                                <Chip
                                                    size="small"
                                                    icon={<VisibilityIcon fontSize="small" />}
                                                    label="Seen"
                                                    color="info"
                                                />
                                            )}
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => onOpenPet(pet.ID)}
                                                aria-label={`Open ${pet.Name} details`}
                                            >
                                                Open details
                                            </Button>
                                            <IconButton
                                                aria-label={`Remove ${pet.Name} from compare`}
                                                color="error"
                                                onClick={() => onRemovePet(pet)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
};

export default CompareTray;
