import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/layouts/ClientLayout'
import type { NextPageWithLayout } from '@/types/page'
import { Box } from '@mui/material'
import EventConfigurator from '@/features/clients/EventConfigurator'

const Configurator: NextPageWithLayout = () => {
    const router = useRouter();

    const [locationId, setLocationId] = useState<number | null>(null);

    useEffect(() => {
        if (router.isReady) {
            const parsedId = parseInt(router.query.id as string, 10)
            if (isNaN(parsedId)) {
                setLocationId(null);
            } else {
                setLocationId(parsedId);
            }
        }
    }, [router.isReady, router.query.id])

    if (locationId === null) {
        return <Box pt={3} sx={{ height: '100vh' }}>
            No Location
        </Box>;
    }

    return (
        <EventConfigurator locationId={locationId} sx={{ height: '100%' }} />
    );
}

// Use ClientLayout as the layout for this page
Configurator.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
}

export default Configurator