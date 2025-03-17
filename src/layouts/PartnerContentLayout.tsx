import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PartnerContentLayoutProps {
    title?: string;
    children: ReactNode;
    controls?: ReactNode;
}

const PartnerContentLayout: React.FC<PartnerContentLayoutProps> = ({
    title,
    children,
    controls
}) => {
    const hasTitle = title && title.length > 0;

    return (
        <Box
            sx={{
                pt: 6,
            }}
        >
            {hasTitle &&
                <>
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
                            borderTop: (theme) => `1px solid ${theme.palette.customColors.blue.halfdark}`,
                            width: '100%',
                            mt: 3,
                        }}
                    />
                </>
            }
            {/* Main Content */}
            <Box
                sx={{
                    // Ensure content starts below the non-transparent header
                    //marginTop: `${theme.layout.headerHeight}px`,
                    marginTop: hasTitle ? { xs: 5, md: 10 } : 0,
                    ml: { xs: 0, sm: 4 },
                    mr: { xs: 0, sm: 4 },
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default PartnerContentLayout;