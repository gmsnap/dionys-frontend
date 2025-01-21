import React, { useState } from 'react';
import { Box, Button, Link, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { ChevronsLeft } from 'lucide-react';
import ProposalBackButton from './ProposalBackButton';

interface SelectorProps {
    previousStep: () => void,
    proposalSent: () => void,
    sx?: SxProps<Theme>;
}

const ProposalSummary = ({
    previousStep,
    proposalSent,
    sx
}: SelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);

    const sendProposal = (): void => {
        console.log("send");
        proposalSent?.();
    };

    return (
        <Box sx={{
            width: '100%',
        }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                Dear Mr. Klaustermann, please review and confirm your selected options. Based on your selections, we’ll provide you with an indicative proposal that we can adjust in our next meeting.
            </Typography>
            <Box sx={{
                backgroundColor: 'white',
                width: '100%', // Full width
                position: 'sticky', // Fixes the button at the bottom
                bottom: 0, // Sticks to the bottom of the container
                zIndex: 2, // Ensures button remains above scrolling content
            }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!eventConfiguration?.roomId}
                    sx={{
                        width: '100%',
                        mt: 1,
                        mb: 1,
                    }}
                    onClick={sendProposal}
                >
                    Get my proposal now
                </Button>
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box >
    );
};

export default ProposalSummary;
