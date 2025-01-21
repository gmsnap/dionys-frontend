import { colors } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { light } from '@mui/material/styles/createPalette';

// Define custom colors
const customColors = {
    pink: {
        light: '#DE33C4',
        main: '#9C248A',
        dark: '#781C6A',
        halfdark: '#781C6A78',
        halflight: '#DE33C478',
    },
    purple: '#513185',
    text: {
        primary: '#000000',
        secondary: '#535353',
        tertiary: '#606060',
        input: '#6f6f6f',
    },
    textBackround: {
        halfdark: '#F5F5F5',
        darker: '#E5E5E5',
    },
    gradient: {
        pink: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
    },
} as const;

// Declare custom theme properties
declare module '@mui/material/styles' {
    interface CustomTheme {
        layout: {
            headerHeight: number;
        };
    }

    interface Palette {
        customColors: typeof customColors;
    }
    interface PaletteOptions {
        customColors: typeof customColors;
    }
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: customColors.pink.dark,
        },
        success: {
            main: customColors.pink.light,
        },
        customColors,
    },
    layout: {
        headerHeight: 90,
    },
    typography: {
        h2: {
            fontFamily: "'Gugi', sans-serif",
            color: customColors.purple,
            fontSize: '1.6rem',
            '@media (min-width:600px)': {
                fontSize: '1.8rem',
            },
            '@media (min-width:900px)': {
                fontSize: '2.2rem',
            },
            '@media (min-width:1200px)': {
                fontSize: '2.5rem',
            },
            '@media (min-width:1536px)': {
                fontSize: '3rem',
            },
        },
        h3: {
            fontFamily: "'Nunito', sans-serif",
            color: customColors.pink.dark,
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.05em',
        },
        h5: {
            fontFamily: "'Nunito', sans-serif",
            color: customColors.pink.dark,
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '-0.05em',
        },
        h6: {
            fontFamily: "'Nunito', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.05em',
        },
        body2: {
            fontFamily: "'Nunito', sans-serif",
            color: customColors.text.secondary,
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.05em',
        },
        label: {
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 400,
            fontSize: '16px',
            letterSpacing: '-0.05em',
            lineHeight: '2.4em',
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                subtitle2: {
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    color: customColors.text.tertiary,
                },
            },
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: false,
            },
            styleOverrides: {
                root: {
                    padding: 0, // Remove default padding
                    margin: 0,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    fontFamily: "'Gugi', sans-serif",
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: '-0.07em',
                    textTransform: 'none',
                    boxShadow: 'none',
                    backgroundColor: '#FFFFFF',
                },
                outlinedPrimary: {
                    border: `1px solid ${customColors.text.primary}99`,
                    color: customColors.text.primary,
                },
                outlinedSecondary: {
                    border: `1px solid ${customColors.pink.light}`,
                    color: customColors.pink.light,
                    backgroundImage: customColors.gradient.pink,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    '&:hover': {
                        color: customColors.pink.main,
                        backgroundColor: customColors.pink.dark,
                    },
                },
                containedPrimary: {
                    fontFamily: "'Arial', sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.05em',
                    color: '#FFFFFF',
                    backgroundColor: customColors.pink.dark,
                    borderRadius: 6,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '-0.05em',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '-0.05em',
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'transparent',
                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                    },
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '-0.05em',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 400,
                        fontSize: '16px',
                        letterSpacing: '-0.07em',
                        color: '#6F6F6F',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        '& fieldset': {
                            border: 'none',
                        },
                        '&:hover fieldset': {
                            border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                            border: 'none',
                        },
                        '& .MuiInputBase-input': {
                            paddingTop: 8,
                            paddingBottom: 8,
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 400,
                    fontSize: '16px',
                    letterSpacing: '-0.07em',
                    color: '#6F6F6F',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    '& .MuiSelect-select': {
                        paddingTop: 8,
                        paddingBottom: 8,
                    },
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        // Ensure the thumb stays white when active
                        color: '#fff',
                        // Pink bar when checked
                        '& + .MuiSwitch-track': {
                            opacity: 1,
                            backgroundColor: customColors.pink.dark,
                        },
                    },
                },
                track: {
                    // Default gray track when unchecked
                    backgroundColor: '#AAAAAA',
                },
            },
        },
    },
});

export default theme;