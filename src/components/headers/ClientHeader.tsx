import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    useTheme,
    IconButton,
    Menu,
    MenuItem as MuiMenuItem,
    useMediaQuery
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import MenuItem from '../MenuItem';
import useStore from '@/stores/eventStore';
import { usePathname } from 'next/navigation';
import router from 'next/router';
import { MenuIcon } from 'lucide-react';
import GradientButton from '../GradientButton';

interface HeaderProps {
    transparentHeader: boolean;
}

const Header: FC<HeaderProps> = ({ transparentHeader = false }) => {
    const theme = useTheme();
    const { eventConfiguration, setEventConfiguration } = useStore();
    const pathname = usePathname();

    const [isScrolled, setIsScrolled] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = [
        { "label": "Home", "link": "/" },
        { "label": "Locations", "link": "/locations" },
        { "label": "Services", "link": "/services" },
        { "label": "Über Uns", "link": "/about" },
        { "label": "Kontakt", "link": "/contact" },
    ];

    const handleConfiguratorClick = (locationId: number | null) => {
        /*if (locationId) {
            if (eventConfiguration?.occasion) {
                router.push(`/configurator/${locationId}`);
                return;
            }
        }*/
        setEventConfiguration(null);
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
        if (link === '/' && pathname === '/') {
            return true;
        }
        return link !== '/' && pathname?.startsWith(link);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
                        fontSize: {
                            xs: '24px',
                            sm: '28px',
                            md: '32px',
                            lg: '40px',
                            xl: '40px',
                        },
                        background: transparentHeader && !isScrolled ?
                            '#FFFFFF' :
                            'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingX: {
                            xs: '20px',
                            sm: '30px',
                            md: '40px',
                        },
                        paddingY: {
                            xs: '10px',
                            sm: '15px',
                            md: '20px',
                        },
                        userSelect: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => router.push('/')}
                >
                    DIONYS
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <GradientButton
                        sx={{
                            fontSize: {
                                xs: '10px',
                                sm: '16px',
                                md: '20px',
                            },
                        }}
                        onClick={() => handleConfiguratorClick(eventConfiguration?.locationId ?? null)}
                    >
                        Konfigurator
                    </GradientButton>
                    {isMobile ? (
                        <>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenuOpen}
                            >
                                <MenuIcon color={theme.palette.customColors.pink.dark} />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {menuItems.map((item, index) => (
                                    <MuiMenuItem
                                        key={index}
                                        onClick={() => {
                                            router.push(item.link);
                                            handleMenuClose();
                                        }}
                                        selected={isItemSelected(item.link)}
                                    >
                                        {item.label}
                                    </MuiMenuItem>
                                ))}
                            </Menu>
                        </>
                    ) : (
                        menuItems.map((item, index) => (
                            <MenuItem
                                key={index}
                                href={item.link}
                                transparent={transparentHeader && !isScrolled}
                                isSelected={isItemSelected(item.link)}
                            >
                                {item.label}
                            </MenuItem>
                        ))
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
