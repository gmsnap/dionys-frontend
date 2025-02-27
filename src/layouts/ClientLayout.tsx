import React from 'react';
import { Box, useTheme } from '@mui/material';
import Header from '../components/headers/ClientHeader';

interface ClientLayoutProps {
    transparentHeader?: boolean;
    margins?: boolean | true;
    children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({
    transparentHeader = false,
    margins = true,
    children
}) => {
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
                    backgroundColor: transparentHeader ? 'transparent' : 'primary.main',
                    zIndex: 1201, // Ensure it stays on top
                }}
            >
                <Header transparentHeader={transparentHeader} />
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    // Ensure content starts below the non-transparent header
                    //marginTop: transparentHeader ? 0 : `${theme.layout.headerHeight}px`,
                    //ml: margins ? 4 : 0,
                    //mr: margins ? 4 : 0,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default ClientLayout;