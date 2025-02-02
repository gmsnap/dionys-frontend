import React, { useEffect, useState } from 'react';
import { Box, Button, Grid2, Link, SxProps, TextField, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { ChevronsLeft } from 'lucide-react';
import ProposalBackButton from './ProposalBackButton';
import { Controller, useForm } from 'react-hook-form';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';

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
    const [sending, setIsSending] = useState(false);

    const {
        control,
        reset,
        trigger,
        formState: { errors },
    } = useForm();

    const sendProposal = async () => {
        if (!eventConfiguration) {
            return;
        }

        setIsSending(true);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/eventConfigurations`;
        const method = "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventConfiguration),
        });

        setIsSending(false);

        proposalSent?.();
    };

    const handleFieldBlur = (fieldName: keyof EventConfigurationModel, value: string) => {
        if (eventConfiguration?.booker) {
            setEventConfiguration({
                ...eventConfiguration,
                [fieldName]: value,
            });
        }
    };

    useEffect(() => {
        if (eventConfiguration?.notes) {
            reset(eventConfiguration);
        }
    }, [eventConfiguration]);

    return (
        <Box sx={{
            width: '100%',
            ml: 7,
            mr: 7,
        }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                Dear Mr. Klaustermann, please review and confirm your selected options. Based on your selections, we’ll provide you with an indicative proposal that we can adjust in our next meeting.
            </Typography>

            {/* Company Name */}
            <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                    <Typography variant="label">Kommentar</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                variant="outlined"
                                multiline={true}
                                rows={3}
                                onBlur={(e) => handleFieldBlur("notes", e.target.value)}
                            />
                        )}
                    />
                </Grid2>
            </Grid2>

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
                    disabled={sending}
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
