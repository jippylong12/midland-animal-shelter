import React from 'react';
import { AppBar, Tabs, Tab, Toolbar, Typography } from '@mui/material';

interface HeaderProps {
    selectedTab: number;
    onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    tabLabels: { label: string; icon: JSX.Element }[];
}

const Header: React.FC<HeaderProps> = ({ selectedTab, onTabChange, tabLabels }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    🐾 Midland, Texas Adoptable Pets
                </Typography>
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