// src/components/PetModal.tsx

import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
    CircularProgress,
    Typography,
    Link,
    Grid,
    Box,
    Chip,
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

const parser = new XMLParser();

const InfoRow = ({ label, value, subValue }: { label: string, value?: string | number | null, subValue?: string | null }) => {
    if (!value) return null;
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', py: 0.5 }}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">{label}</Typography>
            <Typography variant="body2" color="text.primary" align="right">
                {value} {subValue && `(${subValue})`}
            </Typography>
        </Box>
    );
};

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
    }, [isOpen, animalID, setModalData, setModalError, setModalLoading]);

    const formatAge = (age: number): string => {
        if (age < 12) {
            return `${age} Month${age !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(age / 12);
        const months = age % 12;
        return `${years} Year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} Month${months !== 1 ? 's' : ''}` : ''}`;
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                    {modalData ? modalData.AnimalName : 'Pet Details'}
                </Typography>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogTitle>
            <DialogContent dividers>
                {modalLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : modalError ? (
                    <DialogContentText color="error">{modalError}</DialogContentText>
                ) : modalData ? (
                    <Grid container spacing={3}>
                        {/* Left Column: Images */}
                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[modalData.Photo1, modalData.Photo2, modalData.Photo3]
                                    .filter(Boolean)
                                    .map((photo, index) => (
                                        <Box
                                            key={index}
                                            component="img"
                                            src={photo || ''}
                                            alt={`Photo ${index + 1}`}
                                            sx={{
                                                width: '100%',
                                                borderRadius: 2,
                                                boxShadow: 2,
                                                objectFit: 'cover',
                                                maxHeight: 400,
                                            }}
                                        />
                                    ))}
                            </Box>
                        </Grid>

                        {/* Right Column: Details */}
                        <Grid item xs={12} md={7}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h4" gutterBottom color="primary.main" fontWeight="bold">
                                    {modalData.AnimalName}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    {modalData.PrimaryBreed} {modalData.SecondaryBreed && `• ${modalData.SecondaryBreed}`}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip label={modalData.Sex} color={modalData.Sex === 'Male' ? 'info' : 'secondary'} size="small" />
                                    <Chip label={formatAge(modalData.Age)} size="small" />
                                    <Chip label={modalData.Location} variant="outlined" size="small" />
                                    <Chip label={modalData.Stage} color="success" variant="outlined" size="small" />
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <InfoRow label="Species" value={modalData.Species} />
                                <InfoRow label="Special Needs" value={modalData.SpecialNeeds} />
                                <InfoRow label="Behavior" value={modalData.BehaviorResult} />
                                <InfoRow label="Reason for Surrender" value={modalData.ReasonForSurrender} />
                                <InfoRow label="Date of Surrender" value={modalData.DateOfSurrender ? new Date(modalData.DateOfSurrender).toLocaleDateString() : null} />
                                <InfoRow label="Previous Environment" value={modalData.PrevEnvironment} />
                                <InfoRow label="Lived with Children" value={modalData.LivedWithChildren} />
                                <InfoRow label="Lived with Animals" value={modalData.LivedWithAnimals} subValue={modalData.LivedWithAnimalTypes} />
                                <InfoRow label="Altered" value={modalData.Altered} />
                                {modalData.Species.toLowerCase() === 'cat' && <InfoRow label="Declawed" value={modalData.Declawed} />}
                                <InfoRow label="Chip Number" value={modalData.ChipNumber} />

                                {modalData.VideoID && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">Video:</Typography>
                                        <Link href={`https://videos.example.com/${modalData.VideoID}`} target="_blank" rel="noopener">
                                            Watch Video
                                        </Link>
                                    </Box>
                                )}

                                {modalData.Dsc && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                            {modalData.Dsc}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Adoption Link */}
                            {modalData.AdoptionApplicationUrl && (
                                <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        href={modalData.AdoptionApplicationUrl}
                                        target="_blank"
                                        rel="noopener"
                                        fullWidth
                                        sx={{ borderRadius: 8, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                                    >
                                        Adopt {modalData.AnimalName}
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                ) : (
                    <DialogContentText>No data available.</DialogContentText>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PetModal;