import React, { ReactNode } from 'react';
import Header from '../components/headers/PartnerHeader';
import { Box, Typography, useTheme } from '@mui/material';

interface PartnerContentLayoutProps {
    title: string;
    children: ReactNode;
}

const PartnerContentLayout: React.FC<PartnerContentLayoutProps> = ({
    title,
    children
}) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                pt: 6,
            }}
        >
            <Typography
                variant='h3'
                sx={{
                    fontFamily: "'Arial', sans-serif",
                    ml: 3,
                }}
            >
                {title}
            </Typography>
            <Box
                sx={{
                    borderTop: (theme) => `1px solid ${theme.palette.customColors.pink.halfdark}`,
                    width: '100%',
                    mt: 3,
                }}
            />
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
        </Box>
    );
};

export default PartnerContentLayout;