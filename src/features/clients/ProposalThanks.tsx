import React, { } from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { CircleCheckBig, Mail, Phone } from 'lucide-react';

interface Props {
    sx?: SxProps<Theme>;
}

const ProposalThanks = ({
    sx
}: Props) => {
    const { location } = useStore();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            ml: 7,
            mr: 7,
        }}>
            <Typography variant='h1' sx={{ color: 'black', mt: 2, mb: 2 }}>
                THANK YOU!
            </Typography>
            <CircleCheckBig size={150} color='#002A58' />
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
                Wir haben Ihre Anfrage erhalten und unser Angebot wird in wenigen Minuten in Ihrem Posteingang sein.
            </Typography>
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
                Sollten Sie weitere Fragen haben, wenden Sie sich bitte direkt an uns
            </Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mt: 2,
            }}>
                <Mail color={'black'} size={20} />
                <Typography sx={{ ml: 1 }}>
                    {"TODO: location email"}
                </Typography>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mt: 1,
                mb: 1,
            }}>
                <Phone color={'black'} size={20} />
                <Typography sx={{ ml: 1 }}>
                    {"TODO: location phone"}
                </Typography>
            </Box>
        </Box >
    );
};

export default ProposalThanks;
