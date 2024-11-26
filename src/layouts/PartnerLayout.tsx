import React, { ReactNode } from 'react';
import Header from '../components/headers/PartnerHeader';
import { Box, useTheme } from '@mui/material';

interface PartnerLayoutProps {
    children: ReactNode;
}

const PartnerLayout: React.FC<PartnerLayoutProps> = ({
    children
}) => {
    const theme = useTheme();
    return (
        <>
            <Header />
            {/* Main Content */}
            <Box
                sx={{
                    // Ensure content starts below the non-transparent header
                    marginTop: `${theme.layout.headerHeight}px`,
                    ml: 4,
                    mr: 4,
                }}
            >
                {children}
            </Box>
        </>
    );
};

export default PartnerLayout;