import { ReactElement, useEffect, useMemo, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import CreateLocationForm from '@/features/partners/CreateLocationForm';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';
import theme from '@/theme';
import LocationGrid from '@/features/partners/LocationGrid';
import EventCategoriesEditor from '@/features/partners/EventCategoriesEditor';
import { WaitIcon } from '@/components/WaitIcon';
import React from 'react';
import { storePartnerLocations } from '@/services/locationService';

interface CategoriesItemProps {
    locationId: number | null;
    onClick: () => void;
}

const CategoriesItem = React.memo(({ locationId, onClick }: CategoriesItemProps) => {
    return (
        <ListItem key={-1} disablePadding>
            <ListItemButton
                onClick={onClick}
                sx={{
                    pt: { xs: 0, sm: 'inherit' },
                    pb: { xs: 0, sm: 'inherit' },
                }}
            >
                <ListItemText
                    primary="Event-Kategorien"
                    primaryTypographyProps={{
                        sx: {
                            fontSize: { xs: '12px', sm: 'unset' },
                            fontWeight: locationId == null
                                ? 800
                                : 'normal',
                            color: locationId == null
                                ? theme.palette.customColors.blue.main
                                : theme.palette.customColors.text.tertiary,
                        }
                    }}
                />
            </ListItemButton>
        </ListItem>
    );
});

CategoriesItem.displayName = 'CategoriesItem';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser } = useStore();
    const { partnerLocations } = useStore();
    const [locationId, setLocationId] = useState<number | null>(null);
    const [editCategories, setEditCategories] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (partnerUser && isLoading) {
            storePartnerLocations();
            setIsLoading(false);
            console.log("storePartnerLocations e")
        }
    }, [partnerUser]);

    console.log("render2")

    if (isLoading) {
        return (
            <WaitIcon sx={{ mt: 20 }} />
        );
    }

    if (editCategories) {
        return (
            <Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'left',
                    alignItems: 'top'
                }}>
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                    }}>
                        <CategoriesItem
                            locationId={locationId}
                            onClick={() => setEditCategories(true)}
                        />
                        <ListItem key={null} disablePadding>
                            <ListItemButton
                                onClick={() => setEditCategories(false)}
                                sx={{
                                    pt: { xs: 0, sm: 'inherit' },
                                    pb: { xs: 0, sm: 'inherit' },
                                }}
                            >
                                <ListItemText
                                    primary="Locations"
                                    primaryTypographyProps={{
                                        sx: {
                                            fontSize: { xs: '12px', sm: 'unset' },
                                            fontWeight: locationId == null
                                                ? 800
                                                : 'normal',
                                            color: locationId == null
                                                ? theme.palette.customColors.blue.main
                                                : theme.palette.customColors.text.tertiary,
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <EventCategoriesEditor />
                </Box>
            </Box>
        );
    }

    if ((!partnerLocations || partnerLocations.length == 0) &&
        locationId !== 0) {
        return (
            <Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'left',
                    alignItems: 'top'
                }}>
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                    }}>
                        <CategoriesItem
                            locationId={locationId}
                            onClick={() => setEditCategories(true)}
                        />
                        <ListItem key={null} disablePadding>
                            <ListItemButton
                                onClick={() => setEditCategories(false)}
                                sx={{
                                    pt: { xs: 0, sm: 'inherit' },
                                    pb: { xs: 0, sm: 'inherit' },
                                }}
                            >
                                <ListItemText
                                    primary="Locations"
                                    primaryTypographyProps={{
                                        sx: {
                                            fontSize: { xs: '12px', sm: 'unset' },
                                            fontWeight: locationId == null
                                                ? 800
                                                : 'normal',
                                            color: locationId == null
                                                ? theme.palette.customColors.blue.main
                                                : theme.palette.customColors.text.tertiary,
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>

                    <Box sx={{
                        width: '50%',
                        mt: 10,
                    }}>
                        <Typography variant="h5" textAlign="center">
                            Erstellen Sie Ihre erste Location
                        </Typography>
                        <LocationGrid
                            selectHandler={setLocationId}
                            sx={{ width: '100%', justifyContent: 'center' }} />
                    </Box>

                </Box>
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
                        <CategoriesItem
                            locationId={locationId}
                            onClick={() => setEditCategories(true)}
                        />
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
                                                : 'normal',
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
                                                    : 'normal',
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
            <PartnerContentLayout
                title='Locations / Venues'
                description='Lege deine Event Locations an und kopiere den Integrationscode für deine Website. '
            >
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default PartnerPage;
