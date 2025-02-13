import React, { useEffect, useState } from 'react';
import { Box, Button, SxProps, Theme } from '@mui/material';
import theme from '@/theme';

interface SelectorProps {
    isDisabled: boolean,
    nextStep: () => void,
    title?: string,
    invert?: boolean,
    sx?: SxProps<Theme>,
}

const ProposalBackButton = ({
    isDisabled,
    nextStep,
    title,
    invert,
    sx,
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
                ...sx
            }}>
            {invert === true
                ? (
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={disabled}
                        sx={{
                            width: '100%',
                            mt: 1,
                            mb: 1,
                            color: theme.palette.customColors.blue.main,
                            border: `1px solid ${theme.palette.customColors.blue.main}`,
                            background: 'white'
                        }}
                        onClick={nextStep}
                    >
                        {title || "Weiter"}
                    </Button>
                )
                : (
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
                        {title || "Weiter"}
                    </Button>
                )
            }

        </Box>
    );
};

export default ProposalBackButton;
