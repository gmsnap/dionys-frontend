import Header from '@/components/headers/AdminHeader';
import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

interface ClientLayoutProps {
    children: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => (
    <Box>
        <Header />
        <main>{children}</main>
    </Box>
);

export default ClientLayout;