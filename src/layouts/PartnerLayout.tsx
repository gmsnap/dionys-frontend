import React, { ReactNode } from 'react';
import Header from '../components/headers/PartnerHeader';

interface PartnerLayoutProps {
    children: ReactNode;
}

const PartnerLayout = ({ children }: PartnerLayoutProps) => (
    <>
        <Header />
        <main>{children}</main>
    </>
);

export default PartnerLayout;