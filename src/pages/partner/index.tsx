import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box } from '@mui/material';
import CreateLocationForm from '@/features/partners/CreateLocationForm';

const ClientHome: NextPageWithLayout = () => {
    return (
        <Box>
            <CreateLocationForm />
        </Box>
    );
};

// Use ClientLayout as the layout for this page
ClientHome.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>{page}</PartnerLayout>;
};

export default ClientHome;