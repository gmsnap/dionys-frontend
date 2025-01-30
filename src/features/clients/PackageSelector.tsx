import React, { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';
import PackagesAccordeonGrid from './PackagesAccordeonGrid';

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
            {location?.rooms && (
                <Box
                    sx={{
                        flex: 1,
                        paddingBottom: '64px',
                    }}
                >
                    <PackagesAccordeonGrid />
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

export default PackageSelector;
