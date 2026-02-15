// src/theme.ts
import { alpha, createTheme } from '@mui/material/styles';
import { amber, blueGrey, green, red } from '@mui/material/colors';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: green[500],
            light: green[400],
            dark: green[600],
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#c96f16',
            light: '#e09440',
            dark: '#9e4f08',
            contrastText: '#ffffff',
        },
        error: {
            main: red.A400,
        },
        warning: {
            main: amber[700],
        },
        background: {
            default: '#f8fbf5',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a2a1d',
            secondary: '#4a5c4d',
        },
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: `'Manrope', 'Nunito Sans', sans-serif`,
        fontSize: 15,
        h4: {
            fontFamily: `'Fraunces', serif`,
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h5: {
            fontFamily: `'Fraunces', serif`,
            fontWeight: 700,
            lineHeight: 1.25,
        },
        h6: {
            fontWeight: 700,
        },
        subtitle1: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: '0.01em',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: green[600],
                    boxShadow: '0 10px 30px rgba(67, 160, 71, 0.25)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    border: '1px solid rgba(64, 109, 73, 0.12)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    paddingInline: 16,
                },
                containedPrimary: {
                    boxShadow: '0 8px 20px rgba(76, 175, 80, 0.24)',
                    '&:hover': {
                        backgroundColor: green[600],
                    },
                },
                outlinedPrimary: {
                    borderColor: alpha(green[700], 0.5),
                    '&:hover': {
                        borderColor: green[800],
                        backgroundColor: alpha(green[700], 0.07),
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    border: '1px solid rgba(64, 109, 73, 0.1)',
                    boxShadow: '0 8px 24px rgba(26, 42, 29, 0.08)',
                    transition: 'transform 220ms ease, box-shadow 220ms ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 14px 30px rgba(26, 42, 29, 0.14)',
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: '#ffd166',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 56,
                    textTransform: 'none',
                    borderRadius: 0,
                    paddingInline: 14,
                    color: alpha('#ffffff', 0.86),
                    fontWeight: 700,
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                    '&.Mui-selected': {
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& fieldset': {
                        borderColor: alpha(blueGrey[700], 0.2),
                    },
                    '&:hover fieldset': {
                        borderColor: alpha(green[700], 0.4),
                    },
                    '&.Mui-focused fieldset': {
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;

export const getStageColor = (stage: string) => {
    const lowerStage = stage.toLowerCase();
    if (lowerStage.includes('available')) return { bgcolor: green[500], color: 'white' };
    if (lowerStage.includes('pending') || lowerStage.includes('hold')) return { bgcolor: '#c96f16', color: 'white' };
    if (lowerStage.includes('foster')) return { bgcolor: '#0f766e', color: 'white' };
    if (lowerStage.includes('adopted')) return { bgcolor: '#1d4ed8', color: 'white' };
    if (lowerStage.includes('deceased')) return { bgcolor: '#6b7280', color: 'white' };
    return { bgcolor: alpha(green[700], 0.1), color: green[700] };
};
