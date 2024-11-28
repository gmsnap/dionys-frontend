import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box } from '@mui/material';
import CreateLocationForm from '@/features/partners/CreateLocationForm';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';

const PartnerPage: NextPageWithLayout = () => {
    return (
        <Box>
            <CreateLocationForm />
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>
        <PartnerContentLayout title='Location'>
            {page}
        </PartnerContentLayout>
    </PartnerLayout>;
};

export default PartnerPage;