import React, { useEffect, useRef } from 'react';
import { Box, Grid2, SxProps, TextField, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';
import { Controller, useForm } from 'react-hook-form';
import {
    BookingUserValidationSchema,
    createEmptyBookingUserModel
} from '@/models/BookingUserModel';
import { yupResolver } from '@hookform/resolvers/yup';

const labelWidth = 4;

interface SelectorProps {
    previousStep: () => void;
    stepCompleted: () => void;
    stepCompletedAndSkip: () => void;
    sx?: SxProps<Theme>;
}

const PersonalDataSelector = ({
    previousStep,
    stepCompleted,
    stepCompletedAndSkip,
    sx
}: SelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: eventConfiguration?.booker || createEmptyBookingUserModel(),
        resolver: yupResolver(BookingUserValidationSchema),
    });

    // Refs for each input field
    const givenNameRef = useRef<HTMLInputElement>(null);
    const familyNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const phoneNumberRef = useRef<HTMLInputElement>(null);

    // Array of refs in order for focus navigation
    const inputRefs = [givenNameRef, familyNameRef, emailRef, phoneNumberRef];

    useEffect(() => {
        if (eventConfiguration?.booker) {
            reset(eventConfiguration.booker);
        }
    }, [eventConfiguration]);

    const handleFormSubmit = (data: any, nextStep: () => void) => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                booker: data
            });
        }
        nextStep(); // Proceed to the next step
    };

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission unless it's the last field
            if (currentIndex < inputRefs.length - 1) {
                // Move to the next field
                inputRefs[currentIndex + 1].current?.focus();
            } else {
                // Submit the form with the default next step (stepCompleted) if it's the last field
                if (isValid) {
                    handleSubmit((data) => handleFormSubmit(data, stepCompleted))();
                }
            }
        }
    };

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative', // Ensure relative positioning for absolute buttons
            ...sx,
        }}>
            <form
                onSubmit={handleSubmit(() => { })}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    alignItems: 'center',
                    overflowY: 'auto', // Ensure form content can scroll
                }}
            >
                <Grid2
                    container
                    rowSpacing={2}
                    sx={{
                        ml: 2,
                        mr: 2,
                        pb: { xs: 20, sm: 16 }, // Add bottom padding for buttons
                        maxWidth: '500px'
                    }}
                >
                    {/* Given Name */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Vorname</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="givenName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        inputRef={givenNameRef}
                                        fullWidth
                                        autoComplete="given-name"
                                        variant="outlined"
                                        error={!!errors.givenName}
                                        helperText={errors.givenName?.message}
                                        onKeyDown={(e) => handleKeyDown(e, 0)}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Family Name */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Nachname</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="familyName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        inputRef={familyNameRef}
                                        fullWidth
                                        autoComplete="family-name"
                                        variant="outlined"
                                        error={!!errors.familyName}
                                        helperText={errors.familyName?.message}
                                        onKeyDown={(e) => handleKeyDown(e, 1)}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Email */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Email</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        inputRef={emailRef}
                                        fullWidth
                                        autoComplete="email"
                                        variant="outlined"
                                        type="email"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        onKeyDown={(e) => handleKeyDown(e, 2)}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Phone */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Telefon</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        inputRef={phoneNumberRef}
                                        fullWidth
                                        autoComplete="tel"
                                        variant="outlined"
                                        type="tel"
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber?.message}
                                        onKeyDown={(e) => handleKeyDown(e, 3)}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>
            </form>

            {/* Navigation Buttons */}
            <Box
                sx={{
                    backgroundColor: 'white',
                    width: '100%',
                    mt: 'auto',
                    pt: 0,
                    pb: 2,
                    zIndex: 200,
                    position: 'absolute',
                    bottom: 0,
                }}
            >
                <ProposalNextButton
                    nextStep={() => handleSubmit((data) => handleFormSubmit(data, stepCompletedAndSkip))()}
                    isDisabled={!isValid}
                    sx={{ mt: 2, mb: 0, pb: 0 }}
                />
                <ProposalNextButton
                    nextStep={() => handleSubmit((data) => handleFormSubmit(data, stepCompleted))()}
                    isDisabled={!isValid}
                    title="Rechnungsadresse hinzufügen"
                    invert={true}
                    sx={{ mt: 0, pt: 0 }}
                />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box>
    );
};

export default PersonalDataSelector;