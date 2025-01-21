import React from 'react';
import { Box, Link } from '@mui/material';
import { ChevronsLeft } from 'lucide-react';

interface SelectorProps {
    previousStep: () => void,
}

const ProposalBackButton = ({
    previousStep,
}: SelectorProps) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                pt: 1,
                pb: 1,
            }}>
            <Link
                component="button"
                variant="body2"
                sx={{ display: 'flex', alignItems: 'center', }}
                onClick={() => previousStep?.()}
            >
                <ChevronsLeft size={16} /> {'zurück'}
            </Link>
        </Box>
    );
};

export default ProposalBackButton;
