import { createTheme } from '@mui/material/styles';
import { deDE as coreDeDE } from '@mui/material/locale';
import { deDE } from '@mui/x-date-pickers/locales';

// Define custom colors
const customColors = {
    pink: {
        light: '#DE33C4',
        main: '#9C248A',
        dark: '#781C6A',
        halfdark: '#781C6A78',
        halflight: '#DE33C478',
    },
    blue: {
        light: '#405F82',
        main: '#002A58',
        dark: '#002042',
        halfdark: '#002A5878',
        halflight: '#405F8278',
        contrast: '#006bde',
    },
    purple: '#513185',
    text: {
        primary: '#000000',
        secondary: '#535353',
        tertiary: '#606060',
        input: '#6f6f6f',
        inactive: '#D9D9D9',
    },
    textBackround: {
        halfdark: '#F5F5F5',
        darker: '#E5E5E5',
    },
    gradient: {
        pink: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
        blue: 'linear-gradient(90deg, #405F8278 0%, #002A58 100%)',
    },
    embedded: {
        text: {
            primary: '#000000',
            secondary: '#535353',
            tertiary: '#606060',
        },
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
            main: customColors.blue.main,
        },
        success: {
            main: customColors.blue.light,
        },
        customColors,
    },
    layout: {
        headerHeight: 90,
    },
    typography: {
        h1: {
            fontFamily: "'Roboto', sans-serif",
            fontSize: '38px',
            fontWeight: 600,
            color: 'white',
            letterSpacing: 'normal',
        },
        h2: {
            fontFamily: "'Gugi', sans-serif",
            color: customColors.blue.main,
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
            color: customColors.blue.dark,
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.05em',
        },
        h5: {
            fontFamily: "'Nunito', sans-serif",
            color: customColors.blue.dark,
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
                    borderRadius: 0,
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
                    border: `1px solid ${customColors.blue.light}`,
                    color: customColors.blue.light,
                    backgroundImage: customColors.gradient.blue,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    '&:hover': {
                        color: customColors.blue.main,
                        backgroundColor: customColors.blue.dark,
                    },
                },
                containedPrimary: {
                    fontFamily: "'Arial', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '-0.05em',
                    color: '#FFFFFF',
                    backgroundColor: customColors.blue.main,
                    borderRadius: 0,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '16px',
                    letterSpacing: '-0.05em',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    fontFamily: "'Nunito', sans-serif",
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
                root: {
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: '-0.025em',
                },
                primary: {
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: '-0.025em',
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
                        color: customColors.text.primary,
                        borderRadius: '0px',
                        '& fieldset': {
                            border: `1px solid ${customColors.blue.main}`,
                        },
                        '&:hover fieldset': {
                            border: `1px solid ${customColors.blue.main}`,
                        },
                        '&.Mui-focused fieldset': {
                            border: `2px solid ${customColors.blue.main}`,
                        },
                        '& .MuiInputBase-input': {
                            paddingTop: 8,
                            paddingBottom: 8,
                        },
                    },
                    // Slim scrollbar styling for multiline inputs
                    '& .MuiInputBase-multiline': {
                        '&::-webkit-scrollbar': {
                            width: '6px', // Slim scrollbar width
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f5f5f5', // Scrollbar track color
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888', // Scrollbar thumb color
                            borderRadius: '4px', // Rounded scrollbar
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#555', // Hover effect on scrollbar
                        },
                        scrollbarWidth: 'thin', // Firefox slim scrollbar
                        scrollbarColor: '#888 #f5f5f5', // Firefox thumb and track colors
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
                    borderRadius: '0px',
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
                            backgroundColor: customColors.blue.dark,
                        },
                    },
                },
                track: {
                    // Default gray track when unchecked
                    backgroundColor: '#AAAAAA',
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 400,
                        fontSize: '16px',
                        letterSpacing: '-0.07em',
                        color: '#6F6F6F',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '0px',
                        paddingTop: 0,
                        paddingBottom: 0,
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
    },
},
    deDE,
    coreDeDE,
);

export default theme;