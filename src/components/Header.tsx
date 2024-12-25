// Header.tsx

import React from 'react';
import { AppBar, Tabs, Tab, Toolbar, Typography, Link } from '@mui/material';

interface HeaderProps {
    selectedTab: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    tabLabels: { label: string; icon: JSX.Element }[];
}

const Header: React.FC<HeaderProps> = ({ selectedTab, onTabChange, tabLabels }) => {

    // Function to handle disclaimer link click
    const handleDisclaimerClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        const disclaimerElement = document.getElementById('disclaimer');
        if (disclaimerElement) {
            disclaimerElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div">
                    🐾 Midland, Texas Adoptable Pets
                </Typography>
                <Link
                    href="#disclaimer"
                    onClick={handleDisclaimerClick}
                    color="inherit"
                    underline="hover"
                    variant="body2"
                    sx={{ cursor: 'pointer' }}
                >
                    Disclaimer
                </Link>
            </Toolbar>
            <Tabs value={selectedTab} onChange={onTabChange} variant="scrollable" scrollButtons="auto">
                {tabLabels.map((tab) => (
                    <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
                ))}
            </Tabs>
        </AppBar>
    );
};

export default Header;