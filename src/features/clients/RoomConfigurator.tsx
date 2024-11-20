import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, useTheme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';

interface RoomConfiguratorProps {
    sx?: SxProps<Theme>;
}

const RoomConfigurator = ({ sx }: RoomConfiguratorProps) => {
    const theme = useTheme();
    const { eventConfiguration, setEventConfiguration } = useStore();

    // Function to handle updating the venueId
    const handleVenueChange = (newVenueId: number) => {
        if (eventConfiguration) {
            setEventConfiguration({ ...eventConfiguration, venueId: newVenueId });
        }
    };

    if (!eventConfiguration?.venue) {
        return <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 4 }}>CONFIGURATOR - ROOM</Typography>
            <Typography variant="h6" sx={{ mb: 4 }}>Please select Venue</Typography>
        </Box>;
    };

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 4 }}>CONFIGURATOR - ROOM</Typography>
        </Box>
    );
}

export default RoomConfigurator;