import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import useStore from '@/stores/partnerStore';
import type { NextPageWithLayout } from '@/types/page';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import LocationsDropDown from '@/features/partners/LocationsDropDown';
import { EventPackageModel } from '@/models/EventPackageModel';
import { fetchEventPackages, fetchEventPackagesByCompany } from '@/services/eventPackageService';
import theme from '@/theme';
import EventPackageForm from '@/features/partners/EventPackageForm';
import EventPackageGrid from '@/features/partners/EventPackageGrid';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [locationId, setLocationId] = useState<number | null>(null);
    const [packageId, setPackageId] = useState<number | null>(null);
    const [packages, setPackages] = useState<EventPackageModel[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchPackagesFromApi = async (selected: number | null | undefined = undefined) => {
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }

        const packages = locationId ?
            (await fetchEventPackages(
                locationId,
                setIsLoading,
                setError
            )) :
            await fetchEventPackagesByCompany(
                companyId,
                setIsLoading,
                setError
            );

        if (!packages) {
            setPackages([]);
            setPackageId(null);
            setError("Error fetching Event Packages");
            return;
        }

        // Set rooms to state
        setPackages(packages);
        setError(null);
        if (selected !== undefined) {
            setPackageId(selected);
        }
    };

    useEffect(() => {
        setPackageId(null);
        fetchPackagesFromApi();
    }, [partnerUser, locationId]);

    if (!partnerLocations || partnerLocations.length == 0) {
        return (
            <PartnerContentLayout title='Pakete'>
                <Box sx={{
                    width: '100%',
                    mt: 10,
                }}>
                    <Typography variant="h5" textAlign="center">
                        Erstellen Sie bitte zunächst eine Location.
                    </Typography>
                </Box>
            </PartnerContentLayout>
        );
    }

    return (
        <PartnerContentLayout title='Pakete' controls={
            <LocationsDropDown
                partnerLocations={partnerLocations}
                locationId={locationId}
                onLocationChange={setLocationId}
            />
        }>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'top',
            }}>

                {/* Left Menu (packages selector) */}
                {packages && packages?.length > 0 &&
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                    }}>
                        <ListItem key={null} disablePadding>
                            <ListItemButton
                                onClick={() => setPackageId(null)}
                                sx={{
                                    pt: { xs: 0, sm: 'inherit' },
                                    pb: { xs: 0, sm: 'inherit' },
                                }}
                            >
                                <ListItemText
                                    primary="Alle Pakete"
                                    primaryTypographyProps={{
                                        sx: {
                                            fontSize: { xs: '12px', sm: 'unset' },
                                        }
                                    }}
                                    sx={{
                                        color: packageId == null ?
                                            theme.palette.customColors.pink.light :
                                            'inherit',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                        {packages && packages.map((p) => (
                            <ListItem
                                key={p.id}
                                disablePadding
                                sx={{
                                    ml: { xs: 0, sm: 2 },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => setPackageId(p.id)}
                                    sx={{
                                        pt: { xs: 0, sm: 'unset' },
                                        pb: { xs: 0, sm: 'unset' },
                                    }}
                                >
                                    <ListItemText
                                        primary={p.title}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontSize: { xs: '12px', sm: '16px' },
                                                color: packageId === p.id
                                                    ? theme.palette.customColors.pink.light
                                                    : 'inherit',
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>}

                {/* Right Content (Packages Grid or Packages Form) */}
                {packageId !== null &&
                    partnerUser !== null &&
                    partnerUser.companyId !== null ? (
                    <EventPackageForm
                        packageId={packageId}
                        locationId={locationId}
                        companyId={partnerUser.companyId}
                        created={(id: number) => {
                            fetchPackagesFromApi(id);
                        }}
                        updated={fetchPackagesFromApi}
                        deleted={() => fetchPackagesFromApi(null)}
                    />
                ) : (
                    packages && <EventPackageGrid
                        eventPackages={packages}
                        addButton={true}
                        selectHandler={setPackageId}
                        eventPackagesChanged={fetchPackagesFromApi}
                        sx={{
                            width: '100%',
                            height: '100%',
                            justifyContent: packages.length == 0 ? 'center' : 'inherit'
                        }}
                    />
                )}
            </Box>

        </PartnerContentLayout>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            {page}
        </PartnerLayout>
    );
};

export default PartnerPage;