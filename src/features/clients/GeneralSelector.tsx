import React, { useEffect } from 'react';
import { Box, SxProps, Theme, Typography, Button, Grid2, TextField } from '@mui/material';
import useStore, { createDefaultEventConfigurationModel } from '@/stores/eventStore';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventCategories } from '@/constants/EventCategories';
import DateField from './DateField';
import { EventConfigurationModel, EventConfValidationSchema } from '@/models/EventConfigurationModel';
import TimeField from './TimeField';
import ProposalBackButton from './ProposalBackButton';

interface EventConfiguratorStepProps {
    previousStep: () => void,
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const GeneralSelector = ({
    previousStep,
    stepCompleted }: EventConfiguratorStepProps) => {
    const { location, eventConfiguration, setEventConfiguration } = useStore();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EventConfigurationModel>({
        defaultValues: createDefaultEventConfigurationModel(0),
        resolver: yupResolver<any>(EventConfValidationSchema),
    });

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

    // Watch the 'date' field
    const startDate = useWatch({
        control,
        name: "date",
    });

    // Effect to update endDate when date changes
    useEffect(() => {
        const endDate = watch("endDate");
        if (!startDate || !endDate) return;

        if (endDate > startDate) return;

        const newStartDate = new Date(startDate);
        let newEndDate = new Date(endDate);

        const timeDiff = newEndDate.getTime() - newStartDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff > 0) {
            newEndDate.setDate(newStartDate.getDate() + daysDiff);
        } else if (newEndDate.getDay() != newStartDate.getDay()) {
            /*newEndDate.setDate(newStartDate.getDate() + 1);*/
        }

        if (newEndDate.getTime() <= newStartDate.getTime()) {
            // Set endDate to startDate + 1 hour
            newEndDate = new Date(newStartDate.getTime())
            newEndDate.setHours(newEndDate.getHours() + 1)
        }

        setValue("endDate", newEndDate.getTime());
    }, [startDate, watch, setValue])

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
            ml: 7,
            mr: 7,
        }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid2 container rowSpacing={2}>

                    {/* Persons */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Teilnehmer</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="persons"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        type="number"
                                        error={!!errors.persons}
                                        helperText={errors.persons?.message}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Date */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <DateField
                            control={control}
                            errors={errors}
                            labelWidth={labelWidth}
                        />
                    </Grid2>

                    {/* Time */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <TimeField
                            control={control}
                            fieldName="date"
                            errors={errors}
                            labelText="Uhrzeit (von)"
                            labelWidth={labelWidth}
                        />
                    </Grid2>

                    {/* End Time */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <TimeField
                            control={control}
                            fieldName="endDate"
                            errors={errors}
                            labelText="Uhrzeit (bis)"
                            labelWidth={labelWidth}
                        />
                    </Grid2>

                    {/* Event Category */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Event Type</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="eventCategory"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.eventCategory}
                                        helperText={errors.eventCategory?.message}
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

                <Box sx={{
                    backgroundColor: 'white',
                    width: '100%',
                    position: 'sticky', // Fixes the button at the bottom
                    bottom: 0,
                    zIndex: 2, // Ensures button remains above scrolling content
                }}>
                    {/* Submit */}
                    <Box
                        display={'flex'}
                        gap={2}
                        sx={{
                            width: '100%',
                            xs: 12,
                            mt: 2,
                            pt: 2,
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
                    </Box>
                    <ProposalBackButton previousStep={previousStep} />
                </Box>

            </form>

        </Box>
    );
}

export default GeneralSelector;