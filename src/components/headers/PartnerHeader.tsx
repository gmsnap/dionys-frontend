import { AppBar, Toolbar, Typography, Box, Button, useTheme } from '@mui/material';
import { FC } from 'react';
import { usePathname } from 'next/navigation';
import MenuItem from '../MenuItem';

const Header: FC = () => {
    const theme = useTheme();
    const pathname = usePathname();

    const menuItems = [
        { "label": "Events", "link": "/partner/events" },
        { "label": "Location", "link": "/partner/location" },
        { "label": "Räume", "link": "/partner/rooms" },
        { "label": "Equipment", "link": "/partner/equipment" },
        { "label": "Personal", "link": "/partner/personnel" },
        { "label": "Catering", "link": "/partner/catering" },
    ];

    const isItemSelected = (link: string): boolean => {
        // Exact match for home page
        if (link === '/' && pathname === '/') {
            return true;
        }
        // For other pages, check if pathname starts with the link
        // This handles potential subpages (e.g., /locations/specific-location)
        return link !== '/' && pathname?.startsWith(link);
    };

    return (
        <AppBar
            position="fixed"
            sx={{ backgroundColor: '#ffffff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: `${theme.layout.headerHeight}px`,
                }}
            >
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
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            href={item.link}
                            isSelected={isItemSelected(item.link)}
                        >
                            {item.label}
                        </MenuItem>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;