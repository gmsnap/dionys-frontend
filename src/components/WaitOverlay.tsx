import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const WaitOverlay = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.5)', // 50% opacity white
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000,
            }}
        >
            <CircularProgress color="secondary" />
        </Box>
    );
};

export default WaitOverlay;
