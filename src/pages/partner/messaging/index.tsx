import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import useStore from '@/stores/partnerStore';
import type { NextPageWithLayout } from '@/types/page';
import { Box } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import LocationsDropDown from '@/features/partners/LocationsDropDown';
import { WaitIcon } from '@/components/WaitIcon';
import PageHeadline from '@/features/partners/PageHeadline';

const MessagePage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [locationId, setLocationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    return (
        <Box>
            <PageHeadline title='Messages' />
            <Box sx={{
                mt: { xs: 5, md: 10 },
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                ml: 2,
                mb: 5
            }}>
            </Box>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
MessagePage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default MessagePage;