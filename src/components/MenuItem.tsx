import React from 'react';
import { Button, SxProps, Theme, useTheme } from '@mui/material';

interface MenuItemProps {
    children: React.ReactNode;
    href: string;
    sx?: SxProps<Theme>;
    transparent?: boolean;
    isSelected: boolean | false;
}

const MenuItem: React.FC<MenuItemProps> = ({
    children,
    href,
    sx,
    transparent = false,
    isSelected = false
}) => {
    const theme = useTheme();

    return (
        <Button
            href={href}
            sx={{
                color: isSelected
                    ? theme.palette.customColors.pink.light
                    : (transparent ? 'primary.contrastText' : 'secondary.main'),
                fontFamily: "'Gugi', sans-serif",
                fontSize: '20px',
                fontWeight: 400,
                letterSpacing: '-0.07em',
                backgroundColor: transparent ? 'transparent' : 'inherit',
                ...sx,
            }}
        >
            {children}
        </Button>
    );
};

export default MenuItem;