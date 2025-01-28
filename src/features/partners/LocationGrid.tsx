import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Grid2, CircularProgress, Button } from '@mui/material';
import { User, MapPin, Layers2, Pencil, X } from 'lucide-react';
import useStore from '@/stores/partnerStore';
import GridItem from '../../components/GridItem';
import { formatPrice } from '@/utils/formatPrice';
import { LocationModel } from '@/models/LocationModel';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import {
    fetchLocationsByCompanyId,
    getAggregatedRoomPrices,
    handleDeleteLocation,
    storePartnerLocations
} from '@/services/locationService';
import GridAddItem from '@/components/GridAddItem';

interface ListItem {
    icon: React.ReactNode;
    label: string;
}

interface LocationGridProps {
    sx?: SxProps<Theme>;
    selectHandler?: (id: number) => void;
}

const LocationGrid = ({ sx, selectHandler }: LocationGridProps) => {
    const { partnerUser } = useStore();
    const [locations, setLocations] = useState<LocationModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchLocationsFromApi = async (companyId: number) => {
        try {
            const result = await fetchLocationsByCompanyId(
                companyId,
                setIsLoading,
                setError,
                true);

            if (!result) {
                return;
            }
            setLocations(result);
            setIsLoading(false);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            setError('No companyId found');
            return;
        }

        fetchLocationsFromApi(companyId);
    }, []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <div>Error: {error}</div>
            </Box>
        );
    }

    return (
        <Grid2 container spacing={5} sx={{ ...sx }}>
            {locations.map((location) => (
                <Grid2 key={location.id} size={{ xs: 12, sm: 10, md: 5, lg: 4, xl: 3 }}>
                    <GridItem
                        id={location.id}
                        image={location.image as string}
                        title={location.title}
                        priceTag={`Ab ${formatPrice(getAggregatedRoomPrices(location))} / Tag`}
                        listItems={[
                            { icon: <MapPin />, label: location.area },
                            { icon: <User />, label: '10-50' },
                            {
                                icon: <Layers2 />,
                                label: formatEventCategoriesSync(location.eventCategories)
                            },
                        ]}
                        buttons={[
                            <Button
                                key={`${location.id}-1`}
                                variant="outlined"
                                color="primary"
                                sx={{
                                    flex: 1,
                                    '&:hover': {
                                        borderColor: '#000000',
                                        backgroundColor: '#000000',
                                        color: '#ffffff',
                                    },
                                    '.icon': {
                                        color: '#000000',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                    lineHeight: 0,
                                }}
                                onClick={() => { selectHandler?.(location.id); }}
                            >
                                Edit
                                <Box component="span" sx={{ ml: 1, }}>
                                    <Pencil className="icon" width={12} height={12} />
                                </Box>
                            </Button>,
                            <Button
                                key={`${location.id}-2`}
                                variant="outlined"
                                sx={{
                                    flex: 1,
                                    color: '#ff0000',
                                    borderColor: '#ff0000',
                                    '&:hover': {
                                        borderColor: '#ff0000',
                                        backgroundColor: '#ff0000',
                                        color: '#ffffff',
                                    },
                                    '.icon': {
                                        color: '#ff0000',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                    lineHeight: 0,
                                }}
                                onClick={
                                    () => handleDeleteLocation(
                                        location.id,
                                        partnerUser?.companyId ?
                                            () => {
                                                storePartnerLocations(() => {
                                                    fetchLocationsFromApi(partnerUser.companyId);
                                                });
                                            } :
                                            () => { })
                                }
                            >
                                Delete
                                <Box component="span" sx={{ ml: 1 }}>
                                    <X className="icon" width={16} height={16} />
                                </Box>
                            </Button>,
                        ]}
                    />
                </Grid2>
            ))}

            {/* Add Button (+) */}
            <Grid2 key={-1} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} display="flex">
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <GridAddItem
                        id={-1}
                        handler={() => { selectHandler?.(0); }}
                        sx={{ flex: 1, height: '100%' }}
                    />
                </Box>
            </Grid2>
        </Grid2 >
    );
};

export default LocationGrid;
