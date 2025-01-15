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

    return (
        <Box>
            {isLoggedIn ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'left',
                    alignItems: 'top'
                }}>
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '150px', sm: '200px', md: '250px' },
                    }}>
                        <ListItem key={null} disablePadding>
                            <ListItemButton onClick={() => setLocationId(null)}>
                                <ListItemText
                                    primary="Locations / Venues"
                                    sx={{
                                        color: locationId == null ?
                                            theme.palette.customColors.pink.light :
                                            'inherit',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                        {partnerLocations && partnerLocations.map((location) => (
                            <ListItem
                                key={location.id}
                                disablePadding
                                sx={{
                                    ml: 2,
                                }}
                            >
                                <ListItemButton onClick={() => setLocationId(location.id)}>
                                    <ListItemText
                                        primary={location.title}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontSize: { xs: '12px', sm: '16px' },
                                                color: locationId === location.id
                                                    ? theme.palette.customColors.pink.light
                                                    : 'inherit',
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    {locationId !== null ? (
                        <CreateLocationForm
                            locationId={locationId}
                            locationCreated={setLocationId}
                        />
                    ) : (
                        <LocationGrid selectHandler={setLocationId} />
                    )}
                </Box>
            ) : (
                <Typography variant="h6" textAlign="center">
                    Please log in to create a location.
                </Typography>
            )}
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
