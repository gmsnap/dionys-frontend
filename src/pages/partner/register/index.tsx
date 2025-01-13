import { ReactElement } from 'react';
import { Box } from '@mui/material';
import { SignUp } from '@/components/SignUp';
import PartnerLayout from '@/layouts/PartnerLayout';
import { NextPageWithLayout } from '@/types/page';

const RegisterPage: NextPageWithLayout = () => {
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
                <SignUp />
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
RegisterPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>{page}</PartnerLayout>;
};

export default RegisterPage;