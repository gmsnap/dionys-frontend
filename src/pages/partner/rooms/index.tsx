import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';

const PartnerPage: NextPageWithLayout = () => {
    return (
        <Box>
            <Typography>Rooms here ...</Typography>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>
        <PartnerContentLayout title='Räume'>
            {page}
        </PartnerContentLayout>
    </PartnerLayout>;
};

export default PartnerPage;