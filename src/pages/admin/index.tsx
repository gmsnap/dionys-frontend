import { ReactElement, useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import type { NextPageWithLayout } from '../../types/page';
import { Box, Typography } from '@mui/material';
import { SignUp } from '@/components/SignUp';
import { PartnerUserModel } from '@/models/PartnerUserModel';
import { fetchCompanies, fetchCompanyById, fetchPartners } from '@/services/partnerService';
import { PartnerCompanyModel } from '@/models/PartnerCompanyModel';

const AdminHome: NextPageWithLayout = () => {
    const [partners, setPartners] = useState<PartnerUserModel[] | null>(null);
    const [companies, setCompanies] = useState<PartnerCompanyModel[] | null>(null);

    useEffect(() => {
        const fetchAllPartners = async () => {
            const response = await fetchPartners(null, null);
            if (!response || !response.response.ok) {
                console.log(
                    `Error ${response?.response.status}: ${response?.response.statusText}`
                );
                return;
            }
            setPartners(response.result);
        }

        const fetchAllCompanies = async () => {
            const response = await fetchCompanies(null, null);
            if (!response || !response.response.ok) {
                console.log(
                    `Error ${response?.response.status}: ${response?.response.statusText}`
                );
                return;
            }
            setCompanies(response.result);
        }

        fetchAllPartners();
        fetchAllCompanies();
    }, []);

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
                    flexDirection: 'column',
                    pl: 4,
                    pt: 4,
                    pr: 4,
                    mt: 12,
                }}
            >
                {partners && (
                    <Box sx={{ mb: 4, }}>
                        <Typography variant='h6'>Partner-Users ({partners.length})</Typography>
                        {
                            partners.map((partner, index) => (
                                <Typography key={index}>
                                    {partner.givenName} {partner.familyName},{' '}
                                    {partner.email},{' '}
                                    {partner.companyId}
                                </Typography>
                            ))
                        }
                    </Box>
                )}

                {companies && (
                    <Box>
                        <Typography variant="h6">Companies ({companies.length})</Typography>
                        {companies.map((c, i) =>
                            c.companyName ? (
                                <Typography key={i}>
                                    {c.id},{' '}
                                    {c.companyName},{' '}
                                    {c.companyRegistrationNumber},{' '}
                                    {c.companyTaxId},{' '}
                                    {c.contactEmail}
                                </Typography>
                            ) : (
                                <Typography key={i}>
                                    {c.id},{' '}
                                    [incomplete]
                                </Typography>
                            )
                        )}
                    </Box>
                )}
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