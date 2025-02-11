import React from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import theme from '@/theme';

interface CircleInitialsProps {
    givenName: string,
    familyName: string,
    sx?: SxProps<Theme>,
}

const CircleInitials: React.FC<CircleInitialsProps> = ({
    givenName,
    familyName,
    sx
}) => {

    const getInitials = (givenName: string, familyName: string) => {
        if (!givenName || !familyName) {
            return '';
        }
        const givenInitial = givenName.charAt(0).toUpperCase();
        const familyInitial = familyName.charAt(0).toUpperCase();
        return `${givenInitial}${familyInitial}`
    }

    return (
        <Box
            sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: theme.palette.customColors.blue.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                ...sx,
            }}
        >
            <Typography variant="body1" component="span" fontWeight="bold"
                sx={{
                    fontSize: (sx as any)?.fontSize || '16px',
                    fontFamily: (sx as any)?.fontFamily || 'inherit',
                }}
            >
                {getInitials(givenName, familyName)}
            </Typography>
        </Box>
    );
};

export default CircleInitials;