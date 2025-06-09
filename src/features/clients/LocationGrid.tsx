import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Grid2, CircularProgress, Button } from '@mui/material';
import Link from 'next/link';
import router from 'next/router';
import { User, MapPin, Layers2 } from 'lucide-react';
import useStore, { createDefaultEventConfigurationModel } from '@/stores/eventStore';
import GridItem from '../../components/GridItem';
import { LocationModel } from '@/models/LocationModel';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import { allLocationsUrl } from '@/services/locationService';
import { FormatPrice } from '@/utils/pricingManager';

interface ListItem {
    icon: React.ReactNode;
    label: string;
}

interface LocationGridProps {
    sx?: SxProps<Theme>;
}

const LocationGrid = ({ sx }: LocationGridProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();
    const { eventConfigurationFilters } = useStore();
    const [locations, setLocations] = useState<LocationModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const handleConfigurationClick = (locationId: number): void => {
        if (eventConfiguration) {
            /*if (eventConfiguration.locationId === locationId) {
                if (eventConfiguration.eventCategory) {
                    router.push(`/configurator/?id=${id}`);
                    return;
                }
                router.push(`/configurator/occasion`);
                return;
            }*/
        }
        setEventConfiguration(createDefaultEventConfigurationModel(locationId));
        router.push(`/configurator/occasion`);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(allLocationsUrl);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
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

        fetchData();
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

    const { city } = eventConfigurationFilters || {};

    return (
        <Grid2 container spacing={5} sx={{ ...sx }}>
            {locations
                ?.filter((location) => !city?.value || city.value === location.city)
                .map((location) => (
                    <Grid2 key={location.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <GridItem
                            id={location.id}
                            image={location.image as string}
                            title={location.title}
                            priceTag={`Ab ${FormatPrice.formatPrice(0)} / Tag`}
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
                                    component={Link}
                                    href={`/configurator/?id=${location.id}`}
                                    sx={{ flex: 1 }}
                                >
                                    Mehr Details
                                </Button>,
                                <Button
                                    key={`${location.id}-2`}
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ flex: 1 }}
                                    onClick={() => handleConfigurationClick(location.id)}
                                >
                                    Jetzt Konfigurieren
                                </Button>,
                            ]}
                        />
                    </Grid2>
                ))
            }
        </Grid2 >
    );
};

export default LocationGrid;
