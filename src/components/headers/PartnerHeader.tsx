import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    useTheme,
    IconButton,
    Menu,
    MenuItem as MuiMenuItem,
    useMediaQuery,
    Button
} from '@mui/material';
import { FC, useState } from 'react';
import { usePathname } from 'next/navigation';
import router from 'next/router';
import { MenuIcon } from 'lucide-react';
import MenuItem from '../MenuItem';
import useStore from '@/stores/partnerStore';

const Header: FC = () => {
    const theme = useTheme();
    const pathname = usePathname();
    const { setPartnerUser } = useStore(); // Access logout function from the store

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = [
        { "label": "Events", "link": "/partner/events" },
        { "label": "Location", "link": "/partner/location" },
        { "label": "Räume", "link": "/partner/rooms" },
        { "label": "Equipment", "link": "/partner/equipment" },
        { "label": "Personal", "link": "/partner/personnel" },
        { "label": "Catering", "link": "/partner/catering" },
    ];

    const isItemSelected = (link: string): boolean => {
        if (link === '/' && pathname === '/') return true;
        return link !== '/' && pathname?.startsWith(link);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        setPartnerUser(null); // Clear user data from store
        router.push('/partner'); // Redirect to login page
    };

    return (
        <AppBar
            position="fixed"
            sx={{ backgroundColor: '#ffffff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
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
                        background: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
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
                                <MuiMenuItem onClick={handleLogout}>Logout</MuiMenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            {menuItems.map((item, index) => (
                                <MenuItem
                                    key={index}
                                    href={item.link}
                                    isSelected={isItemSelected(item.link)}
                                >
                                    {item.label}
                                </MenuItem>
                            ))}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleLogout}
                                sx={{
                                    backgroundColor: theme.palette.customColors.pink.dark,
                                    color: '#fff',
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;