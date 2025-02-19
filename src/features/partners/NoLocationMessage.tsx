import { Box, Button } from "@mui/material";

const NoLocationMessage = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Box>Bitte legen Sie zunächst Ihre Location an.</Box>
            <Button
                href='/partner/location'
                sx={{
                    color: 'secondary.main',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    letterSpacing: '-0.07em',
                    mt: 2,
                }}
            >
                Location erstellen
            </Button>
        </Box>
    );
}

export default NoLocationMessage;