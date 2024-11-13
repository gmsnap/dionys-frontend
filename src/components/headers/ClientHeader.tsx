import { AppBar, Toolbar, Typography, Box, useTheme } from '@mui/material';
import { FC } from 'react';
import MenuItem from '../MenuItem';

const Header: FC = () => {
    const theme = useTheme();

    return (
        <AppBar
            position="fixed"
            sx={{ backgroundColor: '#ffffff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Toolbar sx={{
                display: 'flex',
                justifyContent: 'space-between',
                height: `${theme.layout.headerHeight}px`,
            }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontFamily: "'Gugi', sans-serif",
                        fontSize: '40px',
                        background: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingX: '40px',
                        paddingY: '20px',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    DIONYS
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <MenuItem href="/">Home</MenuItem>
                    <MenuItem href="/locations">Locations</MenuItem>
                    <MenuItem href="/configurator">Services</MenuItem>
                    <MenuItem href="/about">Über Uns</MenuItem>
                    <MenuItem href="/contact">Kontakt</MenuItem>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;