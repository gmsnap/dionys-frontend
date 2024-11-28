import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Typography } from '@mui/material';
import CreateLocationForm from '@/features/partners/CreateLocationForm';
import PartnerLoginForm from '@/features/partners/PartnerLoginForm';

const ClientHome: NextPageWithLayout = () => {
    return (
        <Box
            display="flex"
            flexDirection="row"
            width="100vw"
            height="100vh"
        >
            <Box
                sx={{
                    flexBasis: '50%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <PartnerLoginForm />
            </Box>
            <Box
                sx={{
                    flexBasis: '50%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                <Box
                    component="img"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    src="/login.png"
                    alt="Login Image"
                />
            </Box>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
ClientHome.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>{page}</PartnerLayout>;
};

export default ClientHome;