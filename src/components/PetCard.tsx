// PetCard.tsx

import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea, Chip, Box, IconButton, Stack, LinearProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import ScoreIcon from '@mui/icons-material/Score';
import { AdoptableSearch } from '../types';
import { getStageColor } from '../theme';
import { OFFLINE_IMAGE_FALLBACK } from '../utils/imageFallback';

interface PetCardProps {
    pet: AdoptableSearch;
    onClick: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    isSeenEnabled: boolean;
    onMarkAsSeen: () => void;
    isSeen: boolean;
    isNewMatch: boolean;
    isInCompare: boolean;
    isCompareLimitReached: boolean;
    onToggleCompare: () => void;
    matchScore: number | null;
}

const PetCard: React.FC<PetCardProps> = ({
    pet,
    onClick,
    isFavorite,
    onToggleFavorite,
    isSeenEnabled,
    onMarkAsSeen,
    isSeen,
    isNewMatch,
    isInCompare,
    isCompareLimitReached,
    onToggleCompare,
    matchScore,
}) => {

    const formatAge = (age: number): string => {
        if (age < 12) {
            return `${age} Month${age !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(age / 12);
        const months = age % 12;
        return `${years} Year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} Month${months !== 1 ? 's' : ''}` : ''}`;
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardActionArea component="div" onClick={onClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }}>
                <Box sx={{ position: 'relative', width: '100%' }}>
                <CardMedia
                        component="img"
                        height="230"
                        image={pet.Photo || OFFLINE_IMAGE_FALLBACK}
                        alt={pet.Name}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = OFFLINE_IMAGE_FALLBACK;
                        }}
                        sx={{ objectFit: 'cover', filter: isSeen ? 'grayscale(18%) saturate(0.8)' : 'none' }}
                    />
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onToggleFavorite();
                        }}
                        aria-label={isFavorite ? `Remove ${pet.Name} from favorites` : `Add ${pet.Name} to favorites`}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: isFavorite ? '#FFD700' : 'white',
                            backgroundColor: 'rgba(26, 42, 29, 0.36)',
                            '&.Mui-focusVisible': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                                outlineOffset: '3px',
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(26, 42, 29, 0.58)',
                            },
                            zIndex: 10,
                        }}
                    >
                        {isFavorite ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>

                    {isSeenEnabled && (
                        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onMarkAsSeen();
                                }}
                                aria-label={isSeen ? `${pet.Name} already marked as seen` : `Mark ${pet.Name} as seen`}
                                onMouseDown={(e) => e.stopPropagation()}
                                sx={{
                                    color: isSeen ? 'rgba(255, 255, 255, 0.8)' : 'white',
                                    backgroundColor: 'rgba(26, 42, 29, 0.36)',
                                    '&.Mui-focusVisible': {
                                        outline: '2px solid',
                                        outlineColor: 'primary.main',
                                        outlineOffset: '3px',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(26, 42, 29, 0.58)',
                                    },
                                }}
                            >
                                <VisibilityIcon />
                            </IconButton>
                        </Box>
                    )}

                    <Box sx={{ position: 'absolute', top: isSeenEnabled ? 58 : 8, left: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onToggleCompare();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            disabled={isCompareLimitReached && !isInCompare}
                            sx={{
                                color: isInCompare ? 'secondary.main' : 'white',
                                backgroundColor: isInCompare ? 'rgba(201, 111, 22, 0.24)' : 'rgba(26, 42, 29, 0.36)',
                                '&.Mui-focusVisible': {
                                    outline: '2px solid',
                                    outlineColor: 'secondary.main',
                                    outlineOffset: '3px',
                                },
                                '&:hover': {
                                    backgroundColor: isInCompare ? 'rgba(201, 111, 22, 0.36)' : 'rgba(26, 42, 29, 0.58)',
                                },
                                zIndex: 10,
                            }}
                            aria-label={isInCompare ? `Remove ${pet.Name} from compare` : `Add ${pet.Name} to compare`}
                        >
                            {isInCompare ? <LibraryAddCheckIcon /> : <CompareArrowsIcon />}
                        </IconButton>
                    </Box>

                    {isNewMatch && (
                        <Chip
                            size="small"
                            label="NEW"
                            color="secondary"
                            icon={<NewReleasesIcon fontSize="small" />}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 52,
                                fontWeight: 800,
                                zIndex: 10,
                            }}
                        />
                    )}

                    {pet.Stage && (
                        <Chip
                            label={pet.Stage}
                            size="small"
                            sx={{
                                ...getStageColor(pet.Stage),
                                position: 'absolute',
                                left: 10,
                                bottom: 10,
                                fontWeight: 700,
                            }}
                        />
                    )}
                </Box>
                <CardContent sx={{ width: '100%', p: 2, opacity: isSeen ? 0.66 : 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 800, mb: 0 }}>
                            {pet.Name}
                        </Typography>
                        <Chip
                            label={pet.Sex}
                            size="small"
                            sx={{
                                bgcolor: pet.Sex === 'Male' ? '#2196f3' : pet.Sex === 'Female' ? '#f48fb1' : undefined,
                                color: (pet.Sex === 'Male' || pet.Sex === 'Female') ? 'white' : 'text.primary',
                                borderColor: 'transparent',
                            }}
                            variant="filled"
                        />
                    </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                                {pet.PrimaryBreed}
                                {pet.SecondaryBreed && ` • ${pet.SecondaryBreed}`}
                            </Typography>

                            {matchScore === null ? null : (
                                <Box sx={{ mb: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <ScoreIcon color="primary" fontSize="small" />
                                        <Typography variant="body2" fontWeight={600}>
                                            Personal fit: {matchScore}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={matchScore}
                                        sx={{
                                            mt: 0.7,
                                            height: 7,
                                            borderRadius: 999,
                                            bgcolor: 'rgba(15, 89, 2, 0.12)',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 999,
                                            },
                                        }}
                                    />
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                                <Chip label={formatAge(pet.Age)} size="small" />
                                <Chip
                            label={pet.Location}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PetCard;
