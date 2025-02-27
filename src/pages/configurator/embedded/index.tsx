import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { NextPageWithLayout } from '@/types/page'
import { Box, CircularProgress, Typography } from '@mui/material'
import { fetchLocationByCode } from '@/services/locationService'
import EventConfigurator2 from '@/features/clients/EventConfigurator2'
import useStore from '@/stores/eventStore'
import { LocationModel } from '@/models/LocationModel'

const Configurator: NextPageWithLayout = () => {
    const router = useRouter();

    const {
        setLocation,
        setEventConfiguration
    } = useStore();

    const [locationId, setLocationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (router.isReady) {
            // Reset configuration
            setEventConfiguration(null);

            const code = router.query.code as string;
            if (!code) {
                setLocationId(null);
            } else {
                const fetchLocation = async () => {
                    setIsLoading(true);
                    let location: LocationModel | null = null;
                    let attempts = 3;
                    while (!location && attempts-- > 0) {
                        location =
                            await fetchLocationByCode(code, null, null);
                        if (location) {
                            setIsLoading(false);
                            setLocationId(location.id);
                            setLocation(location);
                            return;
                        }
                    }
                    setIsLoading(false);
                    setError('not found');
                    setLocationId(null);
                }
                fetchLocation();
            }
        }
    }, [router.isReady, router.query.code]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    variant="h3"
                    textAlign="center"
                    sx={{
                        mt: 8,
                        mb: 8,
                    }}>
                    Konfigurator wird geladen ...
                </Typography>
                <Box sx={{ height: '100px' }}>
                    <CircularProgress color="secondary" />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="h3" textAlign="center" sx={{ mt: 8 }}>
                Location nicht gefunden!
            </Typography>
        );
    }

    return (
        locationId &&
        <EventConfigurator2 locationId={locationId} sx={{ height: '100%' }} />
    );
}

// Use ClientLayout as the layout for this page
Configurator.getLayout = function getLayout(page: ReactElement) {
    return (<>{page}</>);
}

export default Configurator