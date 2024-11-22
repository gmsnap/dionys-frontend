import { AppBar, Toolbar, Typography, Box, useTheme, Button } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import MenuItem from '../MenuItem';
import useStore from '@/stores/eventStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import router from 'next/router';

interface HeaderProps {
    transparentHeader: boolean;
}

const Header: FC<HeaderProps> = ({ transparentHeader = false }) => {
    const theme = useTheme();
    const { eventConfiguration } = useStore();
    const pathname = usePathname();

    const [isScrolled, setIsScrolled] = useState(false);

    const menuItems = [
        { "label": "Home", "link": "/" },
        { "label": "Locations", "link": "/locations" },
        { "label": "Services", "link": "/services" },
        { "label": "Über Uns", "link": "/about" },
        { "label": "Kontakt", "link": "/contact" },
    ];

    const handleConfiguratorClick = (locationId: number | null) => {
        if (locationId) {
            if (eventConfiguration?.occasion) {
                router.push(`/configurator/${locationId}`);
                return;
            }
        }
        router.push(`/configurator/occasion`);
    };

    useEffect(() => {
        if (!transparentHeader) return;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 200);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [transparentHeader]);

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
            sx={{
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                backgroundColor: transparentHeader
                    ? isScrolled
                        ? '#ffffff'
                        : 'transparent'
                    : '#ffffff',
                boxShadow: transparentHeader && !isScrolled
                    ? 'none'
                    : '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }}
        >
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
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleConfiguratorClick(eventConfiguration?.locationId ?? null)}
                        sx={{ fontSize: '20px' }}
                    >
                        Konfigurator
                    </Button>
                    {menuItems.map((item, index) => (
                        <MenuItem
                            key={index}
                            href={item.link}
                            transparent={transparentHeader && !isScrolled}
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