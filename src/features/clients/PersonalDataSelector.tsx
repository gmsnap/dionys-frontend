import React, { useEffect } from 'react';
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
    previousStep: () => void,
    stepCompleted: () => void,
    stepCompletedAndSkip: () => void,
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

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <form
                onSubmit={handleSubmit(() => { })}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1, // Take up available space
                }}
            >
                <Grid2 container rowSpacing={2}>

                    {/* Given Name */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Vorname</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="givenName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.givenName}
                                        helperText={errors.givenName?.message}
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
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="familyName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.familyName}
                                        helperText={errors.familyName?.message}
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
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        type="email"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
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
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        type="tel"
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber?.message}
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
                    mt: 'auto', // Pushes this box to the bottom
                    pt: 2,
                    pb: 2,
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
