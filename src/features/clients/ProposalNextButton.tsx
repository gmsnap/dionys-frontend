import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';

interface SelectorProps {
    isDisabled: boolean,
    nextStep: () => void,
}

const ProposalBackButton = ({
    isDisabled,
    nextStep,
}: SelectorProps) => {
    const [disabled, setDisabled] = useState(isDisabled);
    useEffect(() => { setDisabled(isDisabled); }, [isDisabled]);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                pt: 1,
                pr: 2,
                pb: 1,
                pl: 2,
            }}>
            <Button
                variant="contained"
                color="primary"
                disabled={disabled}
                sx={{
                    width: '100%',
                    mt: 1,
                    mb: 1,
                }}
                onClick={nextStep}
            >
                Weiter
            </Button>
        </Box>
    );
};

export default ProposalBackButton;
