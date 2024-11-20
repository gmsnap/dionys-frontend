import { ReactElement, useRef, useEffect, useState } from 'react';
import ClientLayout from '@/layouts/ClientLayout';
import type { NextPageWithLayout } from '@/types/page';
import LocationGrid from '@/features/clients/LocationGrid';
import { Box, Typography, Container } from '@mui/material';
import Image from 'next/image';
import LocationFilters from '@/features/clients/LocationFilters';

const Locations: NextPageWithLayout = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };

        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);

        return () => window.removeEventListener('resize', updateHeaderHeight);
    }, []);

    return (
        <Box>
            <Box
                ref={headerRef}
                sx={{
                    position: 'relative',
                    width: 'calc(100% + 64px)',
                    height: { xs: '200px', sm: '300px', md: '400px' },
                    overflow: 'hidden',
                    ml: -5,
                }}>
                <Image
                    src="/locations-header.png"
                    alt="Event locations header image"
                    layout="fill"
                    objectFit="cover"
                    priority
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }}
                >
                    <Typography variant="h2" textAlign="center" color="white" padding={5}>
                        Ihre Eventlocation für unvergessliche Business-Events
                    </Typography>
                </Box>
            </Box>
            <Box pt={3} className="gradient-background">
                <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>
                    Eventlocations
                </Typography>
                <LocationFilters />
                <LocationGrid sx={{ height: '100%' }} />
            </Box>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
Locations.getLayout = function getLayout(page: ReactElement) {
    return <ClientLayout transparentHeader={true}>{page}</ClientLayout>;
};

export default Locations;