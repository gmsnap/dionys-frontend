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
    previousStep: () => void,
    stepCompleted: () => void,
}

const CompanyDataSelector = ({ previousStep, stepCompleted }: SelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();

    const {
        control,
        handleSubmit,
        reset,
        trigger,
        formState: { errors },
    } = useForm<BookingCompanyModel>({
        defaultValues: eventConfiguration?.booker?.bookingCompany || createEmptyBookingCompanyModel(),
        resolver: yupResolver(BookingCompanyModelValidationSchema) as any,
    });

    const tryComplete = async (): Promise<void> => {
        const isValid = await trigger();
        if (!isValid) return;
        stepCompleted?.();
    };

    const handleFieldBlur = (fieldName: keyof BookingCompanyModel, value: string) => {
        if (eventConfiguration?.booker) {
            setEventConfiguration({
                ...eventConfiguration,
                booker: {
                    ...eventConfiguration.booker,
                    bookingCompany: {
                        ...eventConfiguration.booker.bookingCompany,
                        [fieldName]: value,
                    } as BookingCompanyModel,
                },
            });
        }
    };

    useEffect(() => {
        if (eventConfiguration?.booker?.bookingCompany) {
            reset(eventConfiguration.booker.bookingCompany);
        }
    }, [eventConfiguration]);

    return (
        <Box sx={{
            width: '100%',
            ml: 7,
            mr: 7,
        }}>
            <form onSubmit={handleSubmit(tryComplete)}>
                <Grid2 container rowSpacing={2}>

                    {/* Company Name */}
                    <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: '100%' }}>
                        <Grid2 size={{ xs: 12, sm: labelWidth }}>
                            <Typography variant="label">Unternehmensname</Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
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
                                        onBlur={(e) => handleFieldBlur("companyName", e.target.value)}
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
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
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
                                        onBlur={(e) => handleFieldBlur("contactName", e.target.value)}
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
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
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
                                        onBlur={(e) => handleFieldBlur("streetAddress", e.target.value)}
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
                        <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
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
                                        onBlur={(e) => handleFieldBlur("city", e.target.value)}
                                    />
                                )}
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>
            </form>

            {/* Navigation Buttons */}
            <Box sx={{ backgroundColor: 'white', width: '100%', position: 'sticky', bottom: 0, zIndex: 2 }}>
                <ProposalNextButton nextStep={tryComplete} isDisabled={!eventConfiguration?.roomId} />
                <ProposalBackButton previousStep={previousStep} />
            </Box>
        </Box>
    );
};

export default CompanyDataSelector;
