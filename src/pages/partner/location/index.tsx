import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import CreateLocationForm from '@/features/partners/CreateLocationForm';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';
import theme from '@/theme';
import LocationGrid from '@/features/partners/LocationGrid';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [locationId, setLocationId] = useState<number | null>(null);

    useEffect(() => {
        setIsLoggedIn(!!partnerUser);
    }, [partnerUser]);

    if (!isLoggedIn) {
        return (
            <Typography variant="h6" textAlign="center">
                Please log in to create a location.
            </Typography>
        );
    }

    if ((!partnerLocations || partnerLocations.length == 0) &&
        locationId !== 0) {
        return (
            <Box sx={{
                width: '100%',
                mt: 10,
            }}>
                <Typography variant="h5" textAlign="center">
                    Erstellen Sie Ihre  erste Location:
                </Typography>
                <LocationGrid
                    selectHandler={setLocationId}
                    sx={{ width: '100%', justifyContent: 'center' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'top'
            }}>

                {/* Left Menu (locations selector) */}
                {partnerLocations && partnerLocations?.length > 0 &&
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                    }}>
                        <ListItem key={null} disablePadding>
                            <ListItemButton
                                onClick={() => setLocationId(null)}
                                sx={{
                                    pt: { xs: 0, sm: 'inherit' },
                                    pb: { xs: 0, sm: 'inherit' },
                                }}
                            >
                                <ListItemText
                                    primary="Alle Locations"
                                    primaryTypographyProps={{
                                        sx: {
                                            fontSize: { xs: '12px', sm: 'unset' },
                                            fontWeight: locationId == null
                                                ? 800
                                                : 100,
                                            color: locationId == null
                                                ? theme.palette.customColors.blue.main
                                                : theme.palette.customColors.text.tertiary,
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>

                        {partnerLocations.map((location) => (
                            <ListItem
                                key={location.id}
                                disablePadding
                                sx={{
                                    ml: { xs: 0, sm: 2 },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => setLocationId(location.id)}
                                    sx={{
                                        pt: { xs: 0, sm: 'unset' },
                                        pb: { xs: 0, sm: 'unset' },
                                    }}
                                >
                                    <ListItemText
                                        primary={location.title}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontSize: { xs: '12px', sm: '16px' },
                                                fontWeight: locationId === location.id
                                                    ? 800
                                                    : 100,
                                                color: locationId === location.id
                                                    ? theme.palette.customColors.blue.main
                                                    : theme.palette.customColors.text.tertiary,
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                }

                {locationId !== null ? (
                    <CreateLocationForm
                        locationId={locationId}
                        locationCreated={setLocationId}
                    />
                ) : (
                    <LocationGrid
                        selectHandler={setLocationId}
                        sx={{ width: '100%', }} />
                )}
            </Box>
        </Box>
    );
};

// Use PartnerLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout title='Locations / Venues'>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default PartnerPage;
