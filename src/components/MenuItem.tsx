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

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (href === "/payments") {
            event.preventDefault(); // Prevent default navigation
            window.open(href, "_blank");
        }
    };

    return (
        <Button
            href={href}
            onClick={handleClick}
            sx={{
                cursor: 'pointer',
                color: isSelected
                    ? (
                        transparent
                            ? theme.palette.customColors.blue.contrast
                            : theme.palette.customColors.blue.main
                    )
                    : (
                        transparent
                            ? 'primary.contrastText'
                            : theme.palette.customColors.blue.main
                    ),
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '20px',
                fontWeight: isSelected ? 600 : 400,
                backgroundColor: transparent ? 'transparent' : 'inherit',
                whiteSpace: 'nowrap',
                ...sx,
            }}
        >
            {children}
        </Button>
    );
};

export default MenuItem;