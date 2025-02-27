import React, { useEffect } from 'react';
import { Box, SxProps, Theme, Typography, Button, Grid2, TextField } from '@mui/material';
import useStore, { createDefaultEventConfigurationModel } from '@/stores/eventStore';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DateField from './DateField';
import { EventConfigurationModel, EventConfValidationSchema } from '@/models/EventConfigurationModel';
import TimeField from './TimeField';
import ProposalBackButton from './ProposalBackButton';

interface EventConfiguratorStepProps {
    previousStep?: () => void,
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
            const ts = selectedDate.getTime();
            const endDate = new Date(ts);
            endDate.setHours(endDate.getHours() + (data.duration || 2));
            setEventConfiguration({
                ...eventConfiguration,
                ...data,
                date: ts,
                endDate: endDate.getTime(),
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
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1, // Take up available space
                }}
            >
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

                    {/* Duration */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Dauer (in Stunden)</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                            <Controller
                                name="duration"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        type="number"
                                        error={!!errors.duration}
                                        helperText={errors.duration?.message}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                </Grid2>

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
                    {previousStep &&
                        <ProposalBackButton previousStep={previousStep} />}
                </Box>

            </form>

        </Box>
    );
}

export default GeneralSelector;