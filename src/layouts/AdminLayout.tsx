import React, { ReactNode } from 'react';
import Header from '../components/headers/AdminHeader';

interface ClientLayoutProps {
    children: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => (
    <>
        <Header />
        <main>{children}</main>
    </>
);

export default ClientLayout;