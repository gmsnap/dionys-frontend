import { ReactElement } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box } from '@mui/material';
import PartnerLoginForm from '@/features/partners/PartnerLoginForm';

const ClientHome: NextPageWithLayout = () => {
    return (
        <Box
            display="flex"
            flexDirection="row"
            sx={{
                width: { xs: '100%', sm: '100vw' },
                height: { xs: '100%', sm: '100vh' },
            }}
        >
            <Box
                sx={{
                    flexBasis: { xs: '100%', sm: '50%' },
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt:{ xs: '100px', sm: 0 },
                }}
            >
                <PartnerLoginForm />
            </Box>
            <Box
                sx={{
                    flexBasis: { xs: '0%', sm: '50%' },
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