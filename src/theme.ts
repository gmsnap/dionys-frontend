import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#781C6A',
        },
    },
    layout: {
        headerHeight: 90,
    },
    typography: {
        h2: {
            fontFamily: "'Gugi', sans-serif",
            color: '#513185',
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
            color: '#781C6A',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.05em',
        },
        body2: {
            fontFamily: "'Nunito', sans-serif",
            color: '#535353',
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.05em',
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                subtitle2: {
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#606060',
                },
            },
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: false,
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
                    textTransform: 'none',  // Disable uppercase text
                    boxShadow: 'none',
                    backgroundColor: '#FFFFFF',
                },
                outlinedPrimary: {
                    border: '1px solid #00000099',
                    color: '#000000',
                },
                outlinedSecondary: {
                    border: '1px solid #DE33C4',
                    color: '#DE33C4',
                    backgroundImage: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    '&:hover': {
                        color: '#9C248A', // Darker pink on hover
                    },
                },
                containedPrimary: {
                    fontFamily: "'Arial', sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.05em',
                    color: '#FFFFFF',
                    backgroundColor: '#781C6A',
                    borderRadius: 6,
                },
            },
        },
    },
});

export default theme;
