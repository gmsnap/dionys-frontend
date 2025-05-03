import React, { ReactNode } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import theme from '@/theme';

interface PartnerContentLayoutProps {
    title?: string;
    description?: string;
    children: ReactNode;
    controls?: ReactNode;
    line?: boolean;
    margins?: number;
}

const PartnerContentLayout: React.FC<PartnerContentLayoutProps> = ({
    title,
    description,
    children,
    controls,
    line,
    margins,
}) => {
    //const isMobile = useMediaQuery(theme.breakpoints.down("md"))
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
                            width: '100%',
                        }}>
                        <Box sx={{ width: '100%' }}>
                            <Typography
                                variant='h3'
                                sx={{
                                    fontFamily: "'Arial', sans-serif",
                                    ml: 3,
                                }}
                            >
                                {title}
                            </Typography>
                        </Box>
                        {controls && <Box sx={{ mr: 4 }}>{controls}</Box>}
                    </Box>
                    {line !== false && <Box
                        sx={{
                            borderTop: `1px solid ${theme.palette.customColors.blue.halfdark}`,
                            width: '100%',
                            mt: 3,
                        }}
                    />}
                    {description &&
                        <Typography
                            variant='body1'
                            sx={{
                                color: theme.palette.customColors.blue.dark,
                                maxWidth: { xs: '100%', md: '60%' },
                                mt: 3,
                                ml: 3,
                            }}
                        >
                            {description.split('. ').map((part, index, array) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < array.length - 1 && '.'}
                                    {index < array.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </Typography>
                    }
                </>
            }
            {/* Main Content */}
            <Box
                sx={{
                    // Ensure content starts below the non-transparent header
                    //marginTop: `${theme.layout.headerHeight}px`,
                    marginTop: hasTitle ? { xs: 5, md: 10 } : 0,
                    ml: { xs: 0, sm: margins ?? 4 },
                    mr: { xs: 0, sm: margins ?? 4 },
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default PartnerContentLayout;