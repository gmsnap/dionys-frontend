import React, { useEffect, useState } from 'react';
import { Box, Link, Modal, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { CircleCheckBig, Mail, Phone } from 'lucide-react';
import { fetchCompanyById } from '@/services/partnerService';
import { PartnerCompanyModel } from '@/models/PartnerCompanyModel';
import EventConfigurationDetails from './EventConfigurationDetails';

interface Props {
    sx?: SxProps<Theme>;
}

const ProposalThanks = ({
    sx
}: Props) => {
    const { eventConfiguration, location } = useStore();
    const [partnerCompany, setPartnerCompany] = useState<PartnerCompanyModel | null>(null);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    useEffect(() => {
        if (location?.companyId) {
            const fetchCompany = async (companyId: number) => {
                const response = await fetchCompanyById(companyId, null, null);
                if (response && response.response.ok) {
                    setPartnerCompany(response.result);
                }
            }
            fetchCompany(location?.companyId);
        }
    }, [location]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            ml: 7,
            mr: 7,
            pl: 2,
            pr: 2,
        }}>
            <Typography variant='h1' sx={{ textAlign: 'center', color: 'black', mt: 2, mb: 2 }}>
                Danke für deine Anfrage
            </Typography>
            <CircleCheckBig size={120} color='#002A58' />
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
                Wir haben deine Anfrage erhalten und schicken dir sofort ein erstes Angebot via Email.
            </Typography>
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
                Falls du Fragen hast melde dich gerne direkt bei uns.
            </Typography>
            {partnerCompany?.contactEmail &&
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    mt: 2,
                }}>
                    <Mail color={'black'} size={20} />
                    <Typography sx={{ ml: 1, }}>
                        <Link
                            href={`mailto:${partnerCompany.contactEmail}`}
                            sx={{
                                fontWeight: 700,
                                color: 'black',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {partnerCompany.contactEmail}
                        </Link>
                    </Typography>
                </Box>
            }
            {partnerCompany?.phoneNumber &&
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    mt: 1,
                    mb: 1,
                }}>
                    <Phone color={'black'} size={20} />
                    <Typography sx={{ ml: 1 }}>
                        {partnerCompany.phoneNumber}
                    </Typography>
                </Box>
            }
            <Typography sx={{ mt: 5, ml: 1, }}>
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => { setShowSummary(!showSummary) }}
                >
                    Daten überprüfen
                </Link>
            </Typography>

            {showSummary && eventConfiguration &&
                <Modal
                    open={showSummary}
                    onClose={() => setShowSummary(false)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: "80%",
                            height: "80%",
                        }}
                    >
                        <EventConfigurationDetails
                            model={eventConfiguration}
                            showNotes={true}
                            sx={{
                                backgroundColor: "white",
                                width: "100%",
                                height: "100%",
                                overflowY: "auto",
                                p: 5,
                                textAlign: 'center'
                            }}
                        />
                    </Box>
                </Modal>
            }
        </Box >
    );
};

export default ProposalThanks;
