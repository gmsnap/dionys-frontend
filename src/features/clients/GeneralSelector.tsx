import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Typography, Button, Grid2, TextField } from '@mui/material';
import useStore, { createDefaultEventConfigurationModel } from '@/stores/eventStore';
import { formatEventCategoriesSync, formatEventCategory } from '@/utils/formatEventCategories';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventCategories } from '@/constants/EventCategories';
import DateField from './DateField';
import { EventConfigurationModel, EventConfValidationSchema } from '@/models/EventConfigurationModel';

interface EventConfiguratorStepProps {
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const GeneralSelector = ({ stepCompleted, sx }: EventConfiguratorStepProps) => {
    const { location, eventConfiguration, setEventConfiguration } = useStore();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<EventConfigurationModel>({
        defaultValues: createDefaultEventConfigurationModel(0),
        resolver: yupResolver<any>(EventConfValidationSchema),
    });

    const onSubmit = async (data: any) => {
        stepCompleted?.();
    };

    useEffect(() => {
        if (eventConfiguration) {
            reset(eventConfiguration);
        }
    }, [eventConfiguration]);

    if (!location) {
        return (
            <Typography>Missing location</Typography>
        );
    }

    if (!eventConfiguration) {
        return (
            <Typography>Missing eventConfiguration</Typography>
        );
    }

    const controlWidth = 7;
    const labelWidth = 4;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}>
                {/* Title */}
                <Grid2 size={{ sm: controlWidth }}>
                    <Grid2 container alignItems="top">
                        <Grid2 size={{ sm: labelWidth }}>
                            <Typography variant="label">Anzahl Teilnehmer</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name="persons"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.persons}
                                        helperText={errors.persons?.message}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>

                {/* Date */}
                <Grid2 size={{ sm: controlWidth }}>
                    <DateField control={control} errors={errors} labelWidth={2} />
                </Grid2>

                {/* Event Category */}
                <Grid2 size={{ sm: controlWidth }}>
                    <Grid2 container alignItems="top">
                        <Grid2 size={{ sm: labelWidth }}>
                            <Typography variant="label">Event Type</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}>
                            <Controller
                                name="occasion"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.occasion}
                                        helperText={errors.occasion?.message}
                                        // Display the translated text
                                        value={field.value
                                            ? formatEventCategoriesSync([field.value as EventCategories])
                                            : ''}
                                        // Maintain the original field value
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            field.onChange(value); // Store the raw field value
                                        }}
                                        // Disable editing if this is a read-only display field
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>

                {/* Submit */}
                <Grid2
                    size={{ xs: controlWidth }}
                    display={'flex'}
                    gap={2}
                    sx={{ xs: 12, mt: 2 }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{
                            width: '100%',
                            mt: 2,
                            mb: 2,
                        }}
                    >
                        Weiter
                    </Button>
                </Grid2>

            </Box>
        </form >
    );
}

export default GeneralSelector;