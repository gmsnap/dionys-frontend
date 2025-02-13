import React, { useEffect, useState } from 'react';
import { Box, Button, Grid2, SxProps, TextField, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import { Controller, useForm } from 'react-hook-form';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import EventConfigurationDetails from './EventConfigurationDetails';

interface SelectorProps {
    previousStep: () => void,
    previousStepdAndSkip: () => void,
    proposalSent: () => void,
    sx?: SxProps<Theme>;
}

const ProposalSummary = ({
    previousStep,
    previousStepdAndSkip,
    proposalSent,
    sx
}: SelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
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
            <Typography variant='body1'>
                <Typography sx={{ fontSize: '14px', textAlign: 'left' }}>
                    {`${eventConfiguration?.booker?.givenName} ${eventConfiguration?.booker?.familyName}`},
                </Typography>
                <Typography sx={{ fontSize: '14px', textAlign: 'left' }}>
                    bitte überprüfen und bestätigen Sie die von Ihnen gewählten Optionen.
                </Typography>
                <Typography sx={{ fontSize: '14px', textAlign: 'left' }}>
                    Auf der Grundlage Ihrer Auswahl werden wir Ihnen einen unverbindlichen Vorschlag unterbreiten,
                    den wir bei unserem nächsten Treffen anpassen können.
                </Typography>
            </Typography>

            {eventConfiguration &&
                <EventConfigurationDetails model={eventConfiguration} sx={{ mt: 2, ml: 0 }} />
            }

            {/* Notes */}
            <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%', mt: 1, mb: 1, }}>
                <Grid2 size={{ xs: 12 }}>
                    <Typography variant="label">Sonderwünsche und Hinweise (optional)</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
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
                    Jetzt mein Angebot anfordern
                </Button>
                <ProposalBackButton previousStep={
                    eventConfiguration?.booker?.bookingCompany
                        ? previousStep
                        : previousStepdAndSkip
                } />
            </Box>
        </Box >
    );
};

export default ProposalSummary;
