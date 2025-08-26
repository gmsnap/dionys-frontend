import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid2,
    SxProps,
    TextField,
    Theme,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import { Controller, useForm } from 'react-hook-form';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import EventConfigurationDetails from './EventConfigurationDetails';
import WaitOverlay from '@/components/WaitOverlay';
import ProposalNextButton from './ProposalNextButton';

interface SelectorProps {
    previousStep: () => void;
    previousStepAndSkip: () => void;
    proposalSent: () => void;
    sx?: SxProps<Theme>;
}

const ProposalSummary = ({
    previousStep,
    previousStepAndSkip,
    proposalSent,
    sx
}: SelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();
    const [sending, setIsSending] = useState(false);
    const [openTermsDialog, setOpenTermsDialog] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [dialogContent, setDialogContent] = useState<{ path: string; title: string }>({
        path: '/terms-of-service/',
        title: 'AGB'
    });

    const {
        control,
        reset,
        formState: { errors },
    } = useForm();

    const handleOpenTermsDialog = (path: string, title: string) => {
        setDialogContent({ path, title });
        setOpenTermsDialog(true);
    };

    const handleCloseTermsDialog = () => {
        setOpenTermsDialog(false);
        setTermsAccepted(false); // Reset checkbox when closing without agreeing
    };

    const handleAcceptTerms = async () => {
        if (termsAccepted) {
            setOpenTermsDialog(false);
            await sendProposal();
        }
    };

    const sendProposal = async () => {
        if (!eventConfiguration) {
            return;
        }

        setIsSending(true);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/eventConfigurations`;
        const method = "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventConfiguration),
            });

            if (!response.ok) {
                throw new Error('Failed to send proposal');
            }

            proposalSent?.();
        } catch (error) {
            console.error('Error sending proposal:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFieldBlur = (fieldName: keyof EventConfigurationModel, value: string) => {
        if (eventConfiguration?.booker) {
            setEventConfiguration({
                ...eventConfiguration,
                [fieldName]: value,
            });
        }
    };

    const showCalculation =
        eventConfiguration
        && process.env.NODE_ENV === 'development';

    useEffect(() => {
        if (eventConfiguration?.notes) {
            reset(eventConfiguration);
        }
    }, [eventConfiguration]);

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                ...sx,
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    maxWidth: '700px',
                    ml: 2,
                    mr: 2,
                    pr: { xs: 1, sm: 2 },
                    pb: { xs: 28, sm: 28 },
                }}
            >
                <Typography variant='body1'>
                    <Typography>
                        Vielen Dank für deine Anfrage.<br /><br />
                        Wir schicken dir gleich gerne ein erstes, unverbindliches Angebot zu und melden uns zeitnah persönlich bei dir.<br />
                        <br />
                        Wünsche und Fragen kannst du uns gerne als Kommentar mitgeben:
                    </Typography>
                </Typography>

                {showCalculation && (
                    <EventConfigurationDetails model={eventConfiguration} sx={{ mt: 2, ml: 0 }} />
                )}

                {/* Notes */}
                <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%', mt: 2, mb: 1 }}>
                    <Grid2 size={{ xs: 12 }}>
                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Sonderwünsche und Hinweise (optional)"
                                    fullWidth
                                    variant="outlined"
                                    multiline={true}
                                    rows={3}
                                    onBlur={(e) => handleFieldBlur("notes", e.target.value)}
                                    slotProps={{
                                        inputLabel: {
                                            style: { fontSize: "0.8rem" }
                                        }
                                    }}
                                />
                            )}
                        />
                    </Grid2>
                </Grid2>
            </Box>

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
                <Typography variant='body2' sx={{ textAlign: 'center', mt: 2, mb: 0, p: 2 }}>
                    Mit dem Anklicken von &quot;Angebot anfordern&quot; stimme ich den{' '}
                    <Typography
                        variant='body2'
                        component="span"
                        sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleOpenTermsDialog('/terms-of-service/', 'AGB')}
                    >
                        AGB
                    </Typography>{' '}
                    und{' '}
                    <Typography
                        variant='body2'
                        component="span"
                        sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleOpenTermsDialog('/privacy/', 'Datenschutzbestimmungen')}
                    >
                        Datenschutzbestimmungen
                    </Typography>{' '}
                    von DIONYS zu.
                </Typography>
                <ProposalNextButton
                    nextStep={sendProposal}
                    isDisabled={sending}
                    title="Angebot anfordern"
                    sx={{ mt: 0, mb: 0, pb: 0 }}
                />
                <ProposalBackButton
                    previousStep={
                        eventConfiguration?.booker?.bookingCompany
                            ? previousStep
                            : previousStepAndSkip
                    }
                />
            </Box>

            {/* Terms and Conditions Dialog */}
            <Dialog
                open={openTermsDialog}
                onClose={handleCloseTermsDialog}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        height: { xs: '80vh', sm: '70vh' }, // Responsive height
                        maxHeight: '90vh',
                        m: { xs: 1, sm: 2 }, // Margin for mobile
                    },
                }}
            >
                <DialogTitle>{dialogContent.title}</DialogTitle>
                <DialogContent dividers sx={{ p: 0, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            height: '100%',
                            overflowY: 'auto',
                            p: 2,
                        }}
                    >
                        <iframe
                            src={`${window.location.origin}${dialogContent.path}`}
                            title={dialogContent.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCloseTermsDialog}
                        >
                            Schliessen
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {sending && <WaitOverlay />}
        </Box>
    );
};

export default ProposalSummary;