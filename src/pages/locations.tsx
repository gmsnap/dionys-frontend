import { ReactElement } from 'react';
import Layout from '@/layouts/ClientLayout';
import type { NextPageWithLayout } from '@/types/page';
import LocationGrid from '@/features/clients/LocationGrid';
import { Box } from '@mui/material';

const Locations: NextPageWithLayout = () => {
    return (
        <Box pt={3} className="gradient-background" sx={{ height: '100vh' }}>
            <LocationGrid sx={{ height: '100%' }} />
        </Box>
    );
};

// Use ClientLayout as the layout for this page
Locations.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};

export default Locations;