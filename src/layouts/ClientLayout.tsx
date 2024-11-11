import React, { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import Header from '../components/headers/ClientHeader';

interface ClientLayoutProps {
    children: ReactNode;
}

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const theme = useTheme();

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            {/* Fixed Header */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    backgroundColor: 'primary.main', // You can customize this
                    zIndex: 1201, // Ensure it stays on top
                }}
            >                
                <Header />
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    marginTop: `${theme.layout.headerHeight}px`, // Ensure content starts below the header
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default ClientLayout;