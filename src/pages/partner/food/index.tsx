import { ReactElement, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import useStore from '@/stores/partnerStore';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import LocationsDropDown from '@/features/partners/LocationsDropDown';
import PackagesPageContent from '@/features/partners/PackagesPageContent';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [locationId, setLocationId] = useState<number | null>(null);

    if (!partnerLocations || partnerLocations.length == 0) {
        return (
            <PartnerContentLayout title='Food & Beverage'>
                <Box sx={{
                    width: '100%',
                    mt: 10,
                }}>
                    <Typography variant="h5" textAlign="center">
                        Erstellen Sie bitte zunächst eine Location.
                    </Typography>
                </Box>
            </PartnerContentLayout>
        );
    }

    return (
        <PartnerContentLayout title='Food & Beverage' controls={
            <LocationsDropDown
                partnerLocations={partnerLocations}
                locationId={locationId}
                onLocationChange={setLocationId}
            />
        }>
            <PackagesPageContent
                locationId={locationId}
                packageCategory={"catering"}
            />
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