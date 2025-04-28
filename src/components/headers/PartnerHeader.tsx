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
import { FC, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import router from 'next/router';
import { CircleCheckBig, CircleUserRound, MenuIcon, X } from 'lucide-react';
import MenuItem from '../MenuItem';
import PartnerSettings from '@/features/partners/PartnerSettings';
import { useAuthContext } from '@/auth/AuthContext';
import useStore from '@/stores/partnerStore';
import CircleInitials from '../CircleInitials';
import { useHeaderContext } from './PartnerHeaderContext';
import PaymentComponent from '@/features/partners/PaymentComponent';
import { createPartnerUser } from '@/services/partnerService';
import OnboardingAssistant from '@/features/partners/OnboardingAssistant';
import { useSetLocationByCurrentPartner } from '@/services/locationService';
import { hasSubscription } from '@/services/paymentService';

const Header: FC = () => {
    const theme = useTheme();

    const pathname = usePathname();

    const { authUser, logout, authLoading } = useAuthContext();
    const { isOverlayOpen, setIsOverlayOpen } = useHeaderContext();
    const { isPaymentOverlayOpen, setIsPaymentOverlayOpen } = useHeaderContext();
    const { isOnboardingOverlayOpen, setIsOnboardingOverlayOpen } = useHeaderContext();

    const { setPartnerUser } = useStore();
    const partnerUser = useStore((state) => state.partnerUser);
    const { setPartnerLocations } = useStore();
    const partnerLocations = useMemo(() => useStore.getState().partnerLocations, []);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [userPanelAnchorEl, setUserPanelAnchorEl] = useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const publicPartnerRoutes: string[] = [
        '/partner/register',
        '/partner/recovery',
    ];

    const menuItems = useMemo(
        () => [
            { label: 'Dashboard', link: '/partner/events' },
            { label: 'Messages', link: '/partner/messaging' },
            { label: 'Locations', link: '/partner/location' },
            { label: 'Rooms & Tables', link: '/partner/rooms' },
            { label: 'Food & Beverage', link: '/partner/food' },
            { label: 'Look & Feel', link: '/partner/lookandfeel' },
            { label: 'Revenue Manager', link: '/partner/revenuemanager' },
        ],
        [],
    );

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

    const handleCloseOnboarding = () => {
        setIsOnboardingOverlayOpen(null);
    };

    useSetLocationByCurrentPartner();

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
            (!router.pathname || !publicPartnerRoutes.includes(router.pathname))) {
            router.push('/partner');
            return;
        }
    }, [authUser, authLoading]);

    useEffect(() => {
        if (authLoading) return;

        if (!authUser?.username) {
            setPartnerUser(null);
            setPartnerLocations(null);
            return;
        }

        console.log("authUser", authUser)
        if (partnerUser === null) {
            const fetchUserData = async () => {
                await createPartnerUser(authUser,
                    (result) => {
                        setPartnerUser(result);
                    },
                    (message) => {
                        setPartnerUser(null);
                    }
                );
            }

            fetchUserData();
            return;
        }
    }, [authUser]);

    useEffect(() => {
        if (!partnerUser) {
            setIsPaymentOverlayOpen(false);
            setIsOnboardingOverlayOpen(null);
            return;
        }

        if (!hasSubscription(partnerUser)) {
            setIsPaymentOverlayOpen(true);
            setIsOnboardingOverlayOpen(null);
            return;
        }

        /*if (partnerUser &&
            partnerLocations &&
            !onboardingCompleted(partnerUser, partnerLocations)
        ) {
            setIsPaymentOverlayOpen(false);
            setIsOnboardingOverlayOpen(true);
        }*/
    }, [partnerUser, partnerLocations]);

    const logoutButton = useMemo(
        () => (
            <Button
                variant="contained"
                color="primary"
                onClick={authUser ? handleLogout : () => router.push('/partner')}
                sx={{ ml: 2, mr: 2 }}
            >
                {authUser ? 'Logout' : 'Login'}
            </Button>
        ),
        [authUser, handleLogout],
    );

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
                                            onClick={(e) => {
                                                e.stopPropagation();
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
                                    {authUser && <Button
                                        onClick={handleOpenOverlay}
                                        sx={{ mb: 1, width: '100%', color: 'inherit' }}
                                    >
                                        Einstellungen
                                    </Button>}

                                    <Box sx={{ width: '100%', alignItems: 'center' }}>
                                        {logoutButton}
                                    </Box>
                                </Box>
                            </Popover>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Settings Overlay (Desktop) */}
            {isOverlayOpen && !isMobile && (
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

            {/* Settings Overlay (Mobile) */}
            {isOverlayOpen && isMobile && (
                <Box
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    sx={{
                        position: 'fixed',
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#fff',
                        zIndex: 1300,
                        padding: '20px',
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
            )}

            {/* Payment Overlay */}
            {isPaymentOverlayOpen && (
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
                        zIndex: 1301,
                        padding: { xs: 0, sm: '50px' },
                    }}
                >
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: { xs: 'center', },
                            gap: 6,
                            backgroundColor: '#fff',
                            pl: '20px',
                            pr: '20px',
                            pt: { xs: '0px', },
                            borderRadius: '16px',
                            width: 'calc(100% - 100px)',
                            height: 'calc(100% - 100px)',
                            boxShadow: theme.shadows[5],
                            position: 'relative',
                        }}
                    >
                        <CircleCheckBig size={120} color='#002A58' />
                        <Typography sx={{
                            textAlign: 'center',
                            ml: { xs: 0, sm: 8 },
                            mr: { xs: 0, sm: 8 },
                        }}
                        >
                            Dein Login war erfolgreich. <br />Bitte wähle dein Abo:
                        </Typography>
                        <PaymentComponent />
                        {logoutButton}
                    </Box>
                </Box>
            )}

            {/* Onboarding Overlay */}
            {isOnboardingOverlayOpen != null && !isMobile && (
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
                        alignContent: 'top',
                        zIndex: 11,
                        padding: { xs: 0, sm: '50px' },
                    }}
                    onClick={handleCloseOnboarding}
                >
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: { xs: 'flex-start', },
                            gap: 6,
                            backgroundColor: '#fff',
                            pl: '20px',
                            pr: '20px',
                            pt: { xs: '0px', },
                            borderRadius: '16px',
                            width: 'calc(100% - 100px)',
                            height: 'calc(100% - 100px)',
                            boxShadow: theme.shadows[5],
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                mt: 1,
                                maxWidth: '85%'
                            }}
                        >
                            <Typography sx={{
                                textAlign: 'center',
                                ml: { xs: 0, sm: 8 },
                                mr: { xs: 0, sm: 8 }, mt: 10
                            }}
                            >
                                Jetzt die letzten Einrichtungsschritte erledigen
                            </Typography>
                            <OnboardingAssistant />
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Onboarding Overlay (Mobile) */}
            {isOnboardingOverlayOpen != null && isMobile && (
                <Box
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    sx={{
                        position: 'fixed',
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#fff',
                        zIndex: 1300,
                        padding: '20px',
                    }}
                >
                    <IconButton
                        sx={{ position: 'absolute', top: '10px', right: '10px' }}
                        onClick={handleCloseOnboarding}
                    >
                        <X />
                    </IconButton>
                    <OnboardingAssistant sx={{ mt: 5 }} />
                </Box>
            )}

        </>
    );
};

export default Header;
