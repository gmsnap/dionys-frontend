import { ReactElement } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import type { NextPageWithLayout } from '../../types/page';
import { Box } from '@mui/material';
import { SignUp } from '@/components/SignUp';
import ConfirmSignup from '@/features/admins/ConfirmSignup';

const AdminHome: NextPageWithLayout = () => {
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
                <ConfirmSignup />
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
                    src="/admin-login.png"
                    alt="Login Image"
                />
            </Box>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
AdminHome.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout>{page}</AdminLayout>;
};

export default AdminHome;