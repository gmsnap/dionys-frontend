import React, { useState } from 'react';
import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';

interface SelectorProps {
    previousStep: () => void,
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const PackageSelector = ({
    previousStep,
    stepCompleted,
    sx
}: SelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);

    const tryComplete = (): void => {
        stepCompleted?.();
    };

    return (
        <Box sx={{
            width: '100%',
        }}>
            <Typography variant="h3" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                Packages (WIP)
            </Typography>
            <Box sx={{
                backgroundColor: 'white',
                width: '100%', // Full width
                position: 'sticky', // Fixes the button at the bottom
                bottom: 0, // Sticks to the bottom of the container
                zIndex: 2, // Ensures button remains above scrolling content
            }}>
                <ProposalNextButton
                    nextStep={tryComplete}
                    isDisabled={!eventConfiguration?.roomId} />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box >
    );
};

export default PackageSelector;
