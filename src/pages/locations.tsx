import { ReactElement } from 'react';
import Layout from '../layouts/ClientLayout';
import type { NextPageWithLayout } from '../types/page';
import Head from 'next/head';
import LocationGrid from '@/features/clients/LocationGrid';

const Locations: NextPageWithLayout = () => {
    return (
        <>
            <Head>
                <title>Client Dashboard</title>
                <meta name="description" content="Manage your event locations and bookings." />
            </Head>
            <>
                <LocationGrid />
            </>
        </>
    );
};

// Use ClientLayout as the layout for this page
Locations.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};

export default Locations;