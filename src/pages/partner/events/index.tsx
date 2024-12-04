import { ReactElement, useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';
import PartnerLayout from '@/layouts/PartnerLayout';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser } = useStore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!partnerUser);
    }, [partnerUser]);

    if (!partnerUser) {
        return (
            <Box>
                <Typography>Please Login</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant='h6' sx={{ mt: 0, mb: 2 }}>
                Willkommen, {partnerUser.givenName} {partnerUser.familyName}!
            </Typography>
            <Typography variant='body1'>
                Noch keine Events erstellt ...
            </Typography>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout title='Overview'>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default PartnerPage;