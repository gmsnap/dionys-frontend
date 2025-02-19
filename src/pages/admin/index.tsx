import { ReactElement, useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import type { NextPageWithLayout } from '../../types/page';
import { Box, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { PartnerUserModel } from '@/models/PartnerUserModel';
import { fetchCompanies, fetchPartners } from '@/services/partnerService';
import { PartnerCompanyModel } from '@/models/PartnerCompanyModel';
import { Building, UserRound } from 'lucide-react';

const AdminHome: NextPageWithLayout = () => {
    const [partners, setPartners] = useState<PartnerUserModel[] | null>(null);
    const [companies, setCompanies] = useState<PartnerCompanyModel[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        const fetchAllPartnersAndCompanies = async () => {
            const response = await fetchPartners(null, null);
            if (!response || !response.response.ok) {
                console.log(
                    `Error ${response?.response.status}: ${response?.response.statusText}`
                );
                return;
            }
            setPartners(response.result);

            const companies = await fetchCompanies(null, null);
            if (!companies || !companies.response.ok) {
                console.log(
                    `Error ${companies?.response.status}: ${companies?.response.statusText}`
                );
                return;
            }
            setCompanies(companies.result);

            setIsLoading(false);
        }

        fetchAllPartnersAndCompanies();
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
                {isLoading ? (
                    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2, textAlign: "center" }}>
                        <CircularProgress color="secondary" />
                        <Typography variant="h5" sx={{ mt: 2 }}>
                            Loading Partners and Companies...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {partners && companies && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6">Partner-Users ({partners.length})</Typography>
                                <List>
                                    {partners.map((partner, index) => {
                                        const company = companies.find(
                                            (c) => c.id === partner.companyId
                                        );
                                        return (
                                            <ListItem
                                                key={index}
                                                disablePadding
                                                sx={{
                                                    ml: 2,
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <UserRound />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        `${partner.givenName} ${partner.familyName}${company ? ` (${company.companyName})` : ''}`
                                                    }
                                                    primaryTypographyProps={{
                                                        sx: {
                                                            fontSize: { xs: '12px', sm: '16px' },
                                                        },
                                                    }}
                                                    secondary={partner.email}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Box>
                        )}

                        {companies && (
                            <Box>
                                <Typography variant="h6"
                                >Companies ({companies.length})
                                </Typography>

                                <List>
                                    {companies.map((c, i) => (
                                        <ListItem
                                            key={i}
                                            disablePadding
                                            sx={{
                                                ml: 2,
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Building />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`${c.companyName}`}
                                                primaryTypographyProps={{
                                                    sx: {
                                                        fontSize: { xs: '12px', sm: '16px' },
                                                    }
                                                }}
                                                secondary={`${c.companyRegistrationNumber} \u2022 ${c.companyTaxId} \u2022 ${c.contactEmail}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                            </Box>
                        )}
                    </>
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
        </Box >
    );
};

// Use ClientLayout as the layout for this page
AdminHome.getLayout = function getLayout(page: ReactElement) {
    return <AdminLayout>{page}</AdminLayout>;
};

export default AdminHome;