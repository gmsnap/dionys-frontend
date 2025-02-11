import React, { useEffect, useState } from 'react';
import { Box, Button, Grid2, Link, SxProps, TextField, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { ChevronsLeft, CircleCheckBig } from 'lucide-react';
import ProposalBackButton from './ProposalBackButton';
import { Controller, useForm } from 'react-hook-form';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';

interface Props {
    sx?: SxProps<Theme>;
}

const ProposalThanks = ({
    sx
}: Props) => {

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
                Your request has been received and our proposal will be in your inbox in a few minutes.
            </Typography>
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
                In case of any further questions, please contact us directly.
            </Typography>
        </Box >
    );
};

export default ProposalThanks;
