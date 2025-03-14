import { ReactElement, useEffect, useState } from 'react';
import useStore from '@/stores/partnerStore';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { EventPackageModel } from '@/models/EventPackageModel';
import { fetchEventPackages, fetchEventPackagesByCompany } from '@/services/eventPackageService';
import theme from '@/theme';
import EventPackageForm from '@/features/partners/EventPackageForm';
import EventPackageGrid from '@/features/partners/EventPackageGrid';
import { PackageCategories } from '@/constants/PackageCategories';

interface Props {
    locationId: number | null;
    packageCategory: PackageCategories;
}

const PackagesPageContent = ({ locationId, packageCategory }: Props) => {
    const { partnerUser } = useStore();
    const [packageId, setPackageId] = useState<number | null>(null);
    const [packages, setPackages] = useState<EventPackageModel[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchPackagesFromApi = async (selected: number | null | undefined = undefined) => {
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }
        try {
            const fetchedPackages = locationId
                ? await fetchEventPackages(locationId, setIsLoading, setError)
                : await fetchEventPackagesByCompany(companyId, setIsLoading, setError);

            setPackages(
                fetchedPackages?.filter((p: EventPackageModel) => {
                    return p.packageCategory === packageCategory;
                }) || []
            );
            setError(null);
            if (selected !== undefined) {
                setPackageId(selected);
            }
        } catch (err) {
            setPackages([]);
            setPackageId(null);
            setError("Error fetching Event Packages");
        } finally {
            setIsLoading(false);
        }
    };

    // Re-fetch packages when locationId changes
    useEffect(() => {
        fetchPackagesFromApi();
    }, [partnerUser, locationId, packageCategory]);

    return (
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
                                        fontWeight: packageId == null
                                            ? 800
                                            : 'normal',
                                        color: packageId == null
                                            ? theme.palette.customColors.blue.main
                                            : theme.palette.customColors.text.tertiary,
                                    }
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
                                            fontWeight: packageId === p.id
                                                ? 800
                                                : 'normal',
                                            color: packageId === p.id
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
    );
}

export default PackagesPageContent;