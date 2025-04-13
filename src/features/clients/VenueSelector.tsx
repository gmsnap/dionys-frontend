import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import useStore from '@/stores/eventStore';
import RoomsAccordionGrid from './RoomsAccordionGrid';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';

interface VenueSelectorProps {
    previousStep: () => void;
    stepCompleted: () => void;
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
                position: 'relative', // Ensure relative positioning for absolute buttons
                ...sx,
            }}
        >
            {location?.rooms && (
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto', // Ensure content can scroll
                        pb: { xs: 20, sm: 16 }, // Add bottom padding for buttons
                    }}
                >
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
                    position: 'absolute',
                    bottom: 0,
                }}
            >
                <ProposalNextButton
                    nextStep={tryComplete}
                    isDisabled={!eventConfiguration?.roomExtras?.length}
                />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box>
    );
};

export default VenueSelector;