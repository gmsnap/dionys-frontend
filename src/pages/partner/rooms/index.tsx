import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import RoomGrid from '@/features/partners/RoomGrid';

const PartnerPage: NextPageWithLayout = () => {
    return (
        <Box>
            <RoomGrid sx={{ height: '100%' }} />
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