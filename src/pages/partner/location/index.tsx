import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';
import CreateLocationForm from '@/features/partners/CreateLocationForm';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser } = useStore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!partnerUser);
    }, [partnerUser]);

    return (
        <Box>
            {isLoggedIn ? (
                <CreateLocationForm />
            ) : (
                <Typography variant="h6" textAlign="center">
                    Please log in to create a location.
                </Typography>
            )}
        </Box>
    );
};

// Use PartnerLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout title='Location'>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default PartnerPage;
