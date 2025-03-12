import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Button, Typography } from '@mui/material';
import router from "next/router";
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import { CircleCheckBig } from 'lucide-react';

const PartnerPage: NextPageWithLayout = () => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6
        }}
        >
            <CircleCheckBig size={120} color='#002A58' />
            <Typography variant='h3'>Danke für deine Zahlung</Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/partner/location')}
                >
                    Jetzt Location anlegen
                </Button>
            </Box>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>
        <PartnerContentLayout>
            {page}
        </PartnerContentLayout>
    </PartnerLayout>;
};

export default PartnerPage;