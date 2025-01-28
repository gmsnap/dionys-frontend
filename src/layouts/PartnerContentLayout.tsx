import React, { ReactNode } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface PartnerContentLayoutProps {
    title: string;
    children: ReactNode;
    controls?: ReactNode;
}

const PartnerContentLayout: React.FC<PartnerContentLayoutProps> = ({
    title,
    children,
    controls
}) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                pt: 6,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <Typography
                    variant='h3'
                    sx={{
                        fontFamily: "'Arial', sans-serif",
                        ml: 3,
                    }}
                >
                    {title}
                </Typography>
                {controls && <Box sx={{ mr: 4 }}>{controls}</Box>}
            </Box>
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
                    //marginTop: `${theme.layout.headerHeight}px`,
                    marginTop: 10,
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