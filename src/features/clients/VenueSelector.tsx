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
        if (eventConfiguration?.roomId) {
            stepCompleted?.();
        }
    };

    return (
        <Box sx={{
            width: '100%',
        }}>
            {location?.rooms && (
                <Box
                    sx={{
                        flex: 1,
                        paddingBottom: '64px',
                    }}
                >
                    <RoomsAccordionGrid />
                </Box>
            )}
            <Box sx={{
                backgroundColor: 'white',
                width: '100%',
                position: 'sticky', // Fixes the button at the bottom
                bottom: 0,
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

export default VenueSelector;
