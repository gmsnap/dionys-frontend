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
    Button,
    Popover
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import router from 'next/router';
import { CircleUserRound, MenuIcon, X } from 'lucide-react';
import MenuItem from '../MenuItem';
import PartnerSettings from '@/features/partners/PartnerSettings';
import { useAuthContext } from '@/auth/AuthContext';
import CircleInitials from '../CircleInitials';
import { useHeaderContext } from './PartnerHeaderContext';

const Header: FC = () => {
    const theme = useTheme();
    const pathname = usePathname();
    const { authUser, logout, authLoading } = useAuthContext();
    const { isOverlayOpen, setIsOverlayOpen } = useHeaderContext();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [userPanelAnchorEl, setUserPanelAnchorEl] = useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = [
        { label: 'Events', link: '/partner/events' },
        { label: 'Locations', link: '/partner/location' },
        { label: 'Räume', link: '/partner/rooms' },
        { label: 'Pakete', link: '/partner/packages' },
        //{ label: 'Equipment', link: '/partner/equipment' },
        //{ label: 'Personal', link: '/partner/personnel' },
        //{ label: 'Catering', link: '/partner/catering' },
    ];

    const isItemSelected = (link: string): boolean => {
        return link === '/' ? pathname === '/' : pathname?.startsWith(link);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUserIconClick = (event: React.MouseEvent<HTMLElement>) => {
        setUserPanelAnchorEl(event.currentTarget);
    };

    const handleUserPanelClose = () => {
        setUserPanelAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
    };

    const handleOpenOverlay = () => {
        setIsOverlayOpen(true);
        handleUserPanelClose();
    };

    const handleCloseOverlay = () => {
        setIsOverlayOpen(false);
    };

    // Close overlay on route change
    useEffect(() => {
        handleUserPanelClose();
        if (isOverlayOpen) {
            handleCloseOverlay();
        }
    }, [pathname]);

    useEffect(() => {
        if (!authLoading &&
            !authUser &&
            router.pathname !== '/partner/register') {
            router.push('/partner');
            return;
        }
    }, [authUser, authLoading]);

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
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
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: {
                                xs: '24px',
                                sm: '28px',
                                md: '32px',
                                lg: '40px',
                                xl: '40px',
                            },
                            background: theme.palette.customColors.blue.main,
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

                    <Box sx={{ display: 'flex' }}>
                        {isMobile ? (
                            <>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={handleMenuOpen}
                                >
                                    <MenuIcon color={theme.palette.customColors.blue.dark} />
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
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'center',
                                mr: 2,
                            }}>
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
                        )}
                        {/* Profile Icon */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleUserIconClick}>
                                {authUser ?
                                    <CircleInitials
                                        givenName={authUser?.givenName ?? ''}
                                        familyName={authUser?.familyName ?? ''}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            fontSize: '14px',
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    /> :
                                    <CircleUserRound width={32} height={32} strokeWidth={1} />
                                }
                            </IconButton>
                            <Popover
                                open={Boolean(userPanelAnchorEl)}
                                anchorEl={userPanelAnchorEl}
                                onClose={handleUserPanelClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                disableScrollLock // Prevents layout shift                                      
                            >
                                <Box
                                    sx={{
                                        pt: 2,
                                        pb: 2,
                                        color: theme.palette.customColors.blue.light,
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    <Button
                                        onClick={handleOpenOverlay}
                                        sx={{ mb: 1, width: '100%', color: 'inherit' }}
                                    >
                                        Einstellungen
                                    </Button>
                                    <Box sx={{ width: '100%', alignItems: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={authUser ? handleLogout : () => router.push('/partner')}
                                            sx={{ ml: 2, mr: 2 }}
                                        >
                                            {authUser ? 'Logout' : 'Login'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Popover>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            {/* Overlay */}
            {isOverlayOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300,
                        padding: '20px',
                    }}
                    onClick={handleCloseOverlay}
                >
                    <Box
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        sx={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '16px',
                            width: 'calc(100% - 100px)',
                            height: 'calc(100% - 100px)',
                            boxShadow: theme.shadows[5],
                            position: 'relative',
                        }}
                    >
                        <IconButton
                            sx={{ position: 'absolute', top: '10px', right: '10px' }}
                            onClick={handleCloseOverlay}
                        >
                            <X />
                        </IconButton>
                        <PartnerSettings />
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Header;
