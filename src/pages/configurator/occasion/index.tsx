import { ReactElement } from 'react';
import Layout from '@/layouts/ClientLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box } from '@mui/material';
import OccasionSelector from '@/features/clients/OccasionSelector';

const OccasionPage: NextPageWithLayout = () => {
    return (
        <Box className="gradient-background" sx={{ height: '100vh' }}>
            <OccasionSelector />
        </Box>
    );
};

// Use ClientLayout as the layout for this page
OccasionPage.getLayout = function getLayout(page: ReactElement) {
    return <Layout
        transparentHeader={true}
        margins={false}
    >
        {page}
    </Layout>;
};

export default OccasionPage;