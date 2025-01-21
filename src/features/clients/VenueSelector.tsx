import React, { useEffect, useState } from 'react';
import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { AvailableEventCategories, EventCategories } from '@/constants/EventCategories';
import router from 'next/router';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import theme from '@/theme';
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
    const [visible, setVisible] = useState(false);

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
                        flex: 1, // Allow this section to take up available space
                        overflowY: 'auto', // Enable scrolling for content
                        paddingBottom: '64px', // Add space to prevent content from being blocked by button
                    }}
                >
                    <RoomsAccordionGrid />
                </Box>
            )}
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

export default VenueSelector;
