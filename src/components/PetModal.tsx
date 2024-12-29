// src/components/PetModal.tsx

import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Typography,
    Link,
    Grid,
    Box,
} from '@mui/material';
import { AdoptableDetails, AdoptableDetailsXmlNode } from '../types';
import { XMLParser } from 'fast-xml-parser';

interface PetModalProps {
    isOpen: boolean;
    animalID: number | null;
    onClose: () => void;
    setModalData: React.Dispatch<React.SetStateAction<AdoptableDetails | null>>;
    setModalError: React.Dispatch<React.SetStateAction<string | null>>;
    setModalLoading: React.Dispatch<React.SetStateAction<boolean>>;
    modalData: AdoptableDetails | null;
    modalError: string | null;
    modalLoading: boolean;
}

const PetModal: React.FC<PetModalProps> = ({
                                               isOpen,
                                               animalID,
                                               onClose,
                                               setModalData,
                                               setModalError,
                                               setModalLoading,
                                               modalData,
                                               modalError,
                                               modalLoading,
                                           }) => {
    const parser = new XMLParser();

    useEffect(() => {
        const fetchPetDetails = async () => {
            if (animalID === null) return;

            setModalLoading(true);
            setModalError(null);
            try {
                const response = await fetch(
                    `https://jztmocmwmf.execute-api.us-east-2.amazonaws.com/Production/COMAPI?animalID=${animalID}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.text();
                const xmlData = parser.parse(data) as AdoptableDetailsXmlNode;
                setModalData(xmlData.adoptableDetails);
            } catch (err: any) {
                console.error('Error fetching detailed pet data:', err);
                setModalError(err.message || 'Failed to fetch detailed pet data.');
            } finally {
                setModalLoading(false);
            }
        };

        if (isOpen && animalID !== null) {
            fetchPetDetails();
        }
    }, [isOpen, animalID, parser, setModalData, setModalError, setModalLoading]);

    const formatAge = (age: number): string => {
        if (age < 12) {
            return `${age} Month${age !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(age / 12);
        const months = age % 12;
        return `${years} Year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} Month${months !== 1 ? 's' : ''}` : ''}`;
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Pet Details</DialogTitle>
            <DialogContent>
                {modalLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : modalError ? (
                    <DialogContentText color="error">{modalError}</DialogContentText>
                ) : modalData ? (
                    <Box>
                        {/* Photo Carousel */}
                        <Box sx={{ flexGrow: 1 }}>
                            <Grid container spacing={2}>
                                {[modalData.Photo1, modalData.Photo2, modalData.Photo3]
                                    .filter(Boolean)
                                    .map((photo, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <img
                                                src={photo || ''}
                                                alt={`Photo ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '300px',
                                                    height: 'auto',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </Grid>
                                    ))}
                            </Grid>
                        </Box>

                        {/* Basic Information */}
                        <Typography gutterBottom variant="h5" component="div" sx={{ marginTop: 2 }}>
                            {modalData.AnimalName}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Species:</strong> {modalData.Species}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Breed:</strong> {modalData.PrimaryBreed}
                            {modalData.SecondaryBreed && ` (${modalData.SecondaryBreed})`}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Gender:</strong> {modalData.Sex}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Age:</strong> {formatAge(modalData.Age)}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Location:</strong> {modalData.Location}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Stage:</strong> {modalData.Stage}
                        </Typography>

                        {/* Additional Information */}
                        <Box sx={{ marginTop: 2 }}>
                            {modalData.SpecialNeeds && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Special Needs:</strong> {modalData.SpecialNeeds}
                                </Typography>
                            )}
                            {modalData.BehaviorResult && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Behavior:</strong> {modalData.BehaviorResult}
                                </Typography>
                            )}
                            {modalData.ReasonForSurrender && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Reason for Surrender:</strong> {modalData.ReasonForSurrender}
                                </Typography>
                            )}
                            {modalData.DateOfSurrender && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Date of Surrender:</strong> {new Date(modalData.DateOfSurrender).toLocaleDateString()}
                                </Typography>
                            )}
                            {modalData.PrevEnvironment && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Previous Environment:</strong> {modalData.PrevEnvironment}
                                </Typography>
                            )}
                            <Typography variant="body1" color="text.secondary">
                                <strong>Lived with Children:</strong> {modalData.LivedWithChildren}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Lived with Other Animals:</strong> {modalData.LivedWithAnimals}
                                {modalData.LivedWithAnimalTypes && ` (${modalData.LivedWithAnimalTypes})`}
                            </Typography>
                            {modalData.Altered && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Altered:</strong> {modalData.Altered}
                                </Typography>
                            )}
                            {modalData.Declawed && modalData.Species.toLowerCase() === 'cat' && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Declawed:</strong> {modalData.Declawed}
                                </Typography>
                            )}
                            {modalData.ChipNumber && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Chip Number:</strong> {modalData.ChipNumber}
                                </Typography>
                            )}
                            {modalData.VideoID && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Video:</strong>{' '}
                                    <Link href={`https://videos.example.com/${modalData.VideoID}`} target="_blank" rel="noopener">
                                        Watch Video
                                    </Link>
                                </Typography>
                            )}
                            {modalData.Dsc && (
                                <Typography variant="body1" color="text.secondary">
                                    <strong>Description:</strong> {modalData.Dsc}
                                </Typography>
                            )}
                        </Box>

                        {/* Adoption Link */}
                        {modalData.AdoptionApplicationUrl && (
                            <Box sx={{ marginTop: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={modalData.AdoptionApplicationUrl}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Start Adoption Application
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <DialogContentText>No data available.</DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PetModal;