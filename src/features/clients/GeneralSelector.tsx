import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Typography, Button, Grid2, TextField } from '@mui/material';
import useStore, { createDefaultEventConfigurationModel } from '@/stores/eventStore';
import { formatEventCategoriesSync, formatEventCategory } from '@/utils/formatEventCategories';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventCategories } from '@/constants/EventCategories';
import DateField from './DateField';
import { EventConfigurationModel, EventConfValidationSchema } from '@/models/EventConfigurationModel';
import TimeField from './TimeField';
import dayjs from 'dayjs';
import ProposalBackButton from './ProposalBackButton';

interface EventConfiguratorStepProps {
    previousStep: () => void,
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const GeneralSelector = ({
    previousStep,
    stepCompleted,
    sx }: EventConfiguratorStepProps) => {
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

    const combineDateAndTime = (date: number, time: number) => {
        const dateObj = dayjs(date); // Dayjs object for date
        const timeObj = dayjs(time); // Dayjs object for time

        // Combine date and time parts
        return dateObj
            .hour(timeObj.hour())
            .minute(timeObj.minute())
            .second(0)
            .millisecond(0)
            .valueOf(); // Return combined timestamp
    };

    const onSubmit = async (data: EventConfigurationModel) => {
        if (eventConfiguration) {
            const selectedDate = new Date(data.date || 0);
            setEventConfiguration({
                ...eventConfiguration,
                ...data,
                date: selectedDate.getTime(), // Ensure final timestamp is correct
            });
        }
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
        <Box sx={{
            width: '100%',
        }}>
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
                        <DateField control={control} errors={errors} labelWidth={labelWidth} />
                    </Grid2>

                    {/* Time */}
                    <Grid2 size={{ sm: controlWidth }}>
                        <TimeField control={control} errors={errors} labelWidth={labelWidth} />
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
                        sx={{
                            xs: 12,
                            mt: 2,
                            pt: 1,
                            pr: 2,
                            pb: 1,
                            pl: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{
                                width: '100%',
                            }}
                        >
                            Weiter
                        </Button>
                    </Grid2>

                </Box>
            </form>
            <ProposalBackButton previousStep={previousStep} />
        </Box>
    );
}

export default GeneralSelector;