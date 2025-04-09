import React, { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import useStore from '@/stores/eventStore';
import RoomsAccordionGrid from './RoomsAccordionGrid';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';

interface VenueSelectorProps {
    previousStep: () => void,
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const VenueSelector = ({
    previousStep,
    stepCompleted,
    sx
}: VenueSelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();

    const tryComplete = (): void => {
        if (eventConfiguration?.roomExtras?.length) {
            stepCompleted?.();
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {location?.rooms && (
                <Box sx={{ flex: 1, }}>
                    <RoomsAccordionGrid />
                </Box>
            )}

            {/* Navigation Buttons */}
            <Box
                sx={{
                    backgroundColor: 'white',
                    width: '100%',
                    mt: 'auto',
                    pt: 2,
                    pb: 2,
                    zIndex: 200,
                }}
            >
                <ProposalNextButton
                    nextStep={tryComplete}
                    isDisabled={!eventConfiguration?.roomExtras?.length} />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box >
    );
};

export default VenueSelector;
