// src/theme.ts
import { createTheme } from '@mui/material/styles';
import { red, orange, green, teal } from '@mui/material/colors';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: green[500],
        },
        secondary: {
            main: teal[500],
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#f0f8ff',
            paper: '#ffffff',
        },
        text: {
            primary: '#333333',
            secondary: '#555555',
        },
    },
    typography: {
        fontFamily: `'Quicksand', sans-serif`,
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: green[600],
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                },
                containedPrimary: {
                    backgroundColor: green[500],
                    '&:hover': {
                        backgroundColor: green[600],
                    },
                },
                containedSecondary: {
                    backgroundColor: teal[500],
                    '&:hover': {
                        backgroundColor: teal[600],
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: orange[500],
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: '#555555', // Default text color
                    backgroundColor: 'transparent',
                    borderRadius: '0px',
                    transition: 'background-color 0.3s, color 0.3s, border-radius 0.3s',
                    '&:hover': {
                        backgroundColor: 'rgba(224, 242, 241, 0.5)', // Semi-transparent teal
                    },
                    '&.Mui-selected': { // Correct approach for selected state
                        color: '#ff9800', // Orange text color
                        backgroundColor: '#e0f2f1', // Light teal background
                        borderRadius: '10px',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    borderRadius: 10,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                standardError: {
                    backgroundColor: red[50],
                    color: red[700],
                },
                standardInfo: {
                    backgroundColor: teal[50],
                    color: teal[700],
                },
            },
        },
        // ... other component overrides
    },
});

export default theme;