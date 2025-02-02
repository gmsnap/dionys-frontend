import React, { useEffect, useState } from 'react';
import { Box, Grid2, SxProps, TextField, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';
import { Controller, useForm } from 'react-hook-form';
import {
    BookingUserModel,
    BookingUserValidationSchema,
    createEmptyBookingUserModel
} from '@/models/BookingUserModel';
import { yupResolver } from '@hookform/resolvers/yup';

const labelWidth = 4;
interface SelectorProps {
    previousStep: () => void,
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const PersonalDataSelector = ({
    previousStep,
    stepCompleted }: SelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();

    const {
        control,
        handleSubmit,
        reset,
        trigger,
        formState: { errors },
    } = useForm({
        defaultValues: eventConfiguration?.booker || createEmptyBookingUserModel(),
        resolver: yupResolver(BookingUserValidationSchema),
    });

    const tryComplete = async (): Promise<void> => {
        const isValid = await trigger(); // Validates all fields
        if (!isValid) return;

        stepCompleted?.();
    };

    const onSubmit = async () => {
    };

    const handleFieldBlur = (fieldName: keyof BookingUserModel, value: string) => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                booker: {
                    ...eventConfiguration.booker,
                    [fieldName]: value,
                } as BookingUserModel,
            });
        }
    };

    useEffect(() => {
        if (!eventConfiguration) {
            return;
        }

        if (eventConfiguration.booker) {
            reset(eventConfiguration.booker);
        }

    }, [eventConfiguration]);

    return (
        <Box sx={{
            width: '100%',
            ml: 7,
            mr: 7,
        }}>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                                        onBlur={(e) => {
                                            field.onBlur(); // Ensure validation is triggered
                                            handleFieldBlur("givenName", e.target.value);
                                        }}
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
                                        onBlur={(e) => {
                                            field.onBlur(); // Ensure validation is triggered
                                            handleFieldBlur("familyName", e.target.value);
                                        }}
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
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        onBlur={(e) => {
                                            field.onBlur(); // Ensure validation is triggered
                                            handleFieldBlur("email", e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Phone */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Phone</Typography>
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
                                        error={!!errors.phoneNumber}
                                        helperText={errors.phoneNumber?.message}
                                        onBlur={(e) => {
                                            field.onBlur(); // Ensure validation is triggered
                                            handleFieldBlur("phoneNumber", e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                </Grid2>

            </form>

            <Box sx={{
                backgroundColor: 'white',
                width: '100%', // Full width
                position: 'sticky', // Fixes the button at the bottom
                bottom: 0, // Sticks to the bottom of the container
                zIndex: 2, // Ensures button remains above scrolling content
            }}>
                <ProposalNextButton
                    nextStep={tryComplete}
                    isDisabled={!eventConfiguration?.roomId} />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box >
    );
};

export default PersonalDataSelector;
