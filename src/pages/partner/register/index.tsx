import { ReactElement, useState } from 'react';
import { Box } from '@mui/material';
import { SignUp } from '@/components/SignUp';
import PartnerLayout from '@/layouts/PartnerLayout';
import { NextPageWithLayout } from '@/types/page';
import PartnerLoginForm from '@/features/partners/PartnerLoginForm';

const RegisterPage: NextPageWithLayout = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

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
                {username && password
                    ? (<PartnerLoginForm credentials={{ username, password }} />)
                    : (
                        <SignUp onSuccess={(username, password) => {
                            setUsername(username);
                            setPassword(password);
                        }} />
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
RegisterPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>{page}</PartnerLayout>;
};

export default RegisterPage;