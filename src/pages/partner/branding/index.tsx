import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import useStore from '@/stores/partnerStore';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import { WaitIcon } from '@/components/WaitIcon';
import BillingDetailsForm from '@/features/partners/BillingDetailsForm';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const pageTitle = 'PDF & Email Anpassungen';
    const pageDescription = 'Hier kannst du das Layout deiner Angebots-PDFs und E-Mails individuell anpassen.';

    useEffect(() => {
        if (partnerUser && partnerLocations) {
            setIsLoading(false);
        }
    }, [partnerUser, partnerLocations]);

    if (isLoading) {
        return (
            <PartnerContentLayout title={pageTitle} description={pageDescription}>
                <WaitIcon sx={{ mt: 20 }} />
            </PartnerContentLayout>
        );
    }

    if (!partnerLocations || partnerLocations.length == 0) {
        return (
            <PartnerContentLayout title={pageTitle} description={pageDescription}>
                <Box sx={{
                    width: '100%',
                    mt: 10,
                }}>
                    <Typography variant="h5" textAlign="center">
                        Erstelle bitte zunächst eine Location.
                    </Typography>
                </Box>
            </PartnerContentLayout>
        );
    }

    return (
        <PartnerContentLayout
            title={pageTitle}
            description={pageDescription}
        >
            <BillingDetailsForm sx={{ maxWidth: 600, }} />
        </PartnerContentLayout>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            {page}
        </PartnerLayout>
    );
};

export default PartnerPage;