import { ReactElement, useState } from 'react';
import { Box } from '@mui/material';
import PartnerLayout from '@/layouts/PartnerLayout';
import { NextPageWithLayout } from '@/types/page';
import RecoveryEmailForm from '@/components/RecoveryEmailForm';
import RecoveryCodeForm from '@/components/RecoveryCodeForm';

const Page: NextPageWithLayout = () => {
    const [email, setEmail] = useState<string | null>(null);

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
                }}
            >
                {!email ? (
                    <RecoveryEmailForm onEmailSubmitted={(email) => {
                        setEmail(email);
                    }} />
                ) : (
                    <RecoveryCodeForm email={email} />
                )}
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
Page.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>{page}</PartnerLayout>;
};

export default Page;