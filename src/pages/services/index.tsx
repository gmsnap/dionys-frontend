import { ReactElement } from 'react';
import Layout from '@/layouts/ClientLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';

const Locations: NextPageWithLayout = () => {
    return (
        <Box pt={3} className="gradient-background" sx={{ height: '100vh' }}>
            <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>Services</Typography>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
Locations.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>;
};

export default Locations;