import { ReactElement } from 'react';
import ClientLayout from '../../layouts/ClientLayout';
import type { NextPageWithLayout } from '../../types/page';
import Head from 'next/head';

const ClientHome: NextPageWithLayout = () => {
    return (
        <>
            <Head>
                <title>Client Dashboard</title>
                <meta name="description" content="Manage your event locations and bookings." />
            </Head>
            <div>
                <h1>Welcome to the Client Dashboard</h1>
                <p>Here you can manage your event locations, view bookings, and more.</p>
                {/* Additional Client-specific content */}
            </div>
        </>
    );
};

// Use ClientLayout as the layout for this page
ClientHome.getLayout = function getLayout(page: ReactElement) {
    return <ClientLayout>{page}</ClientLayout>;
};

export default ClientHome;