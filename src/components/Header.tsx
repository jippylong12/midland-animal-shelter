// Header.tsx

import React from 'react';
import {
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    Typography,
    Box,
    Button,
    Chip,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface HeaderProps {
    selectedTab: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    tabLabels: { label: string; icon: JSX.Element }[];
    filteredCount: number;
    favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({
    selectedTab,
    onTabChange,
    tabLabels,
    filteredCount,
    favoritesCount,
}) => {

    // Function to handle disclaimer link click
    const handleDisclaimerClick = () => {
        const disclaimerElement = document.getElementById('disclaimer');
        if (disclaimerElement) {
            disclaimerElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    alignItems: 'flex-start',
                    pt: { xs: 1.5, md: 2.5 },
                    pb: 1.25,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
                        Midland, Texas Adoptable Pets
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.88)' }}>
                        Browse pets faster, filter better, and keep your shortlist handy.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={`${filteredCount} matching pets`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255, 255, 255, 0.24)', color: '#fff' }}
                        />
                        <Chip
                            label={`${favoritesCount} favorites`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255, 255, 255, 0.24)', color: '#fff' }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        color="inherit"
                        startIcon={<ArrowDownwardIcon fontSize="small" />}
                        onClick={handleDisclaimerClick}
                        sx={{ borderColor: 'rgba(255, 255, 255, 0.42)', color: '#fff' }}
                    >
                        Disclaimer
                    </Button>
                </Box>
            </Toolbar>
            <Box sx={{ px: { xs: 1, md: 2 }, pb: 1.5 }}>
                <Tabs
                    value={selectedTab}
                    onChange={onTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="species tabs"
                >
                    {tabLabels.map((tab) => (
                        <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
                    ))}
                </Tabs>
            </Box>
        </AppBar>
    );
};

export default Header;
