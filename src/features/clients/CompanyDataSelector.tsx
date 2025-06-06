import React, { useEffect } from 'react';
import { Box, Grid2, TextField, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import ProposalBackButton from './ProposalBackButton';
import ProposalNextButton from './ProposalNextButton';
import { Controller, useForm } from 'react-hook-form';
import {
    BookingCompanyModel,
    BookingCompanyModelValidationSchema,
    createEmptyBookingCompanyModel
} from '@/models/BookingCompanyModel';
import { yupResolver } from '@hookform/resolvers/yup';

const labelWidth = 4;

interface SelectorProps {
    previousStep: () => void;
    stepCompleted: () => void;
}

const CompanyDataSelector = ({ previousStep, stepCompleted }: SelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();

    const {
        control,
        handleSubmit,
        reset,
        trigger,
        getValues,
        formState: { errors, isValid },
    } = useForm<BookingCompanyModel>({
        defaultValues: eventConfiguration?.booker?.bookingCompany || createEmptyBookingCompanyModel(),
        resolver: yupResolver(BookingCompanyModelValidationSchema) as any,
    });

    const tryComplete = async (): Promise<void> => {
        const isValid = await trigger();
        if (!isValid) return;
        if (eventConfiguration?.booker) {
            setEventConfiguration({
                ...eventConfiguration,
                booker: {
                    ...eventConfiguration.booker,
                    bookingCompany: getValues(),
                },
            });
        }
        stepCompleted?.();
    };

    useEffect(() => {
        if (eventConfiguration?.booker?.bookingCompany) {
            reset(eventConfiguration.booker.bookingCompany);
        }
    }, [eventConfiguration]);

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative', // Ensure relative positioning for absolute buttons
        }}>
            <form
                onSubmit={handleSubmit(tryComplete)}
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
                    {/* Company Name */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Unternehmensname</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="companyName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.companyName}
                                        helperText={errors.companyName?.message}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Contact Name */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Kontakt-Person</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="contactName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.contactName}
                                        helperText={errors.contactName?.message}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* Street Address */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Rechnungsanschrift</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="streetAddress"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.streetAddress}
                                        helperText={errors.streetAddress?.message}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>

                    {/* City */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">PLZ und Stadt</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8 }}>
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        variant="outlined"
                                        error={!!errors.city}
                                        helperText={errors.city?.message}
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
                    nextStep={tryComplete}
                    isDisabled={!isValid}
                    sx={{ mt: 2, mb: 0, pb: 0 }}
                />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box>
    );
};

export default CompanyDataSelector;