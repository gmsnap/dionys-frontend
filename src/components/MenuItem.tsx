import React from 'react';
import { Button, SxProps, Theme } from '@mui/material';

interface MenuItemProps {
    children: React.ReactNode;
    href: string;
    sx?: SxProps<Theme>; // Optional extra styles
}

const MenuItem: React.FC<MenuItemProps> = ({ children, href, sx }) => (
    <Button
        href={href}
        sx={{
            color: '#781C6A',
            fontFamily: "'Gugi', sans-serif",
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '-0.07em',
            ...sx, // Allow additional styles to be passed in
        }}
    >
        {children}
    </Button>
);

export default MenuItem;
