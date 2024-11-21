import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Grid2, CircularProgress } from '@mui/material';
import GridItem from '../../components/GridItem';
import { formatPrice } from '@/utils/formatPrice';
import { User, MapPin, Layers2 } from 'lucide-react';
import { LocationModel } from '@/models/LocationModel';

interface ListItem {
    icon: React.ReactNode;
    label: string;
}

interface LocationGridProps {
    sx?: SxProps<Theme>;
}

const LocationGrid = ({ sx }: LocationGridProps) => {
    const [locations, setLocations] = useState<LocationModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`);
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

    return (
        <Grid2 container spacing={5} sx={{ ...sx }}>
            {locations?.map((location) => (
                <Grid2 key={location.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                    <GridItem
                        id={location.id}
                        image={location.image}
                        title={location.title}
                        priceTag={`Ab ${formatPrice(location.price)} / Tag`}
                        listItems={[
                            { icon: <MapPin />, label: location.area },
                            { icon: <User />, label: '10-50' },
                            { icon: <Layers2 />, label: 'Meeting, Lunch, Dinner, Tagung, Seminare & Workshops' },
                        ]}
                    />
                </Grid2>
            ))
            }
        </Grid2 >
    );
};

export default LocationGrid;
