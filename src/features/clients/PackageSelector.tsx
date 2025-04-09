import React, { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';
import PackagesAccordeonGrid from './PackagesAccordeonGrid';
import { PackageCategories } from '@/constants/PackageCategories';

interface SelectorProps {
    previousStep: () => void,
    stepCompleted: () => void,
    packageCategory?: PackageCategories,
    sx?: SxProps<Theme>;
}

const PackageSelector = ({
    previousStep,
    stepCompleted,
    packageCategory,
    sx
}: SelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);

    const tryComplete = (): void => {
        stepCompleted?.();
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
                    <PackagesAccordeonGrid packageCategory={packageCategory} />
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

export default PackageSelector;
