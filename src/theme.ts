import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Customize this color as needed
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#FFC0CB', // Use pink as the secondary color
        },
    },
    layout: {
        headerHeight: 90,
    },
    components: {
        MuiContainer: {
            defaultProps: {
                maxWidth: false,
            },
            styleOverrides: {
                root: {
                    marginLeft: "50px",
                    marginRight: "50px",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    fontFamily: "'Gugi', sans-serif",
                    fontSize: 14,
                    letterSpacing: '-0.07em',
                    textTransform: 'none',  // Disable uppercase text
                    boxShadow: 'none',
                    backgroundColor: '#FFFFFF',
                },
                containedPrimary: {
                    border: '1px solid #00000099',
                    color: '#000000',
                },
                containedSecondary: {
                    border: '1px solid #DE33C4',
                    color: '#DE33C4',
                    backgroundImage: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    '&:hover': {
                        color: '#9C248A', // Darker pink on hover
                    },
                },
            },
        },
    },
});

export default theme;
