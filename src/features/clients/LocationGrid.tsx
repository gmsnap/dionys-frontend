import React, { useEffect, useState } from 'react';
import { Grid2 } from '@mui/material';
import GridItem from '../../components/GridItem';
import { formatPrice } from '@/utils/formatPrice';
import { User, MapPin, Layers2 } from 'lucide-react';

interface ListItem { icon: React.ReactNode; label: string; }

const LocationGrid = () => {
    const [locations, setLocations] = useState<LocationModel[]>([]);
    const [error, setError] = useState<string | null>(null);

    const items: ListItem[] = [
        { icon: <MapPin />, label: 'Marienplatz' },
        { icon: <User />, label: '>10-50' },
        { icon: <Layers2 />, label: 'Meeting, Lunch' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setLocations(result);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            }
        };

        fetchData();
    }, []);

    return (
        <Grid2 container columns={8} spacing={5} className="gradient-background">
            {locations &&
                locations.map((location) => (
                    <Grid2 key={location.id} size={1} minWidth={400}>
                        <GridItem
                            image={location.image}
                            title={location.title}
                            priceTag={`Ab ${formatPrice(location.price)} / Tag`}
                            listItems={items}
                        />
                    </Grid2>
                ))}
        </Grid2>
    );
};

export default LocationGrid;
