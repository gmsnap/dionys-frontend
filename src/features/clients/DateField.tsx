import React from 'react';
import { Controller } from 'react-hook-form';
import { Grid2, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface DateFieldProps {
    control: any;
    errors: any;
    labelWidth: number;
}

const DateField: React.FC<DateFieldProps> = ({ control, errors, labelWidth }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
            <Grid2 container alignItems="top">
                <Grid2 size={{ sm: labelWidth }}>
                    <Typography variant="label">Datum</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field: { onChange, value, ...restField } }) => (
                            <DatePicker
                                {...restField}
                                value={value ? dayjs(new Date(value)) : null}
                                format="D.M.YYYY"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: "outlined",
                                        error: !!errors.date,
                                        helperText: errors.date?.message,
                                    },
                                }}
                            />
                        )}
                    />
                </Grid2>
            </Grid2>
        </LocalizationProvider>
    );
};

export default DateField;