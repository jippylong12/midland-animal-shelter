// src/theme.ts
import { createTheme } from '@mui/material/styles';
import { red, orange, green, teal } from '@mui/material/colors';

// Define the custom theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: green[500], // A vibrant green for primary actions
        },
        secondary: {
            main: teal[500], // A calming teal for secondary actions
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#f0f8ff', // A soft, inviting background color
            paper: '#ffffff', // White for cards and surfaces
        },
        text: {
            primary: '#333333', // Dark text for readability
            secondary: '#555555',
        },
    },
    typography: {
        fontFamily: `'Quicksand', sans-serif`, // A friendly, rounded font
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none', // Keep button text as is
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
                    borderRadius: 20, // Rounded buttons
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
                    borderRadius: 15, // Rounded card corners
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Subtle shadow
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: orange[500], // Highlight active tab with orange
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
    },
});

export default theme;