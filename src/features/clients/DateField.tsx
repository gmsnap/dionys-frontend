import React from 'react';
import { Controller } from 'react-hook-form';
import { Grid2, InputAdornment, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarIcon } from '@mui/x-date-pickers';

interface DateFieldProps {
    control: any;
    errors: any;
    labelWidth: number;
}

const DateField: React.FC<DateFieldProps> = ({ control, errors, labelWidth }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
            <>
                <Grid2 size={{ sm: labelWidth }}>
                    <Typography variant="label">Datum</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field: { onChange, value, ...restField } }) => (
                            <DatePicker
                                {...restField}
                                value={value ? dayjs(value) : null} // Convert timestamp to dayjs
                                format="D.M.YYYY"
                                onChange={(newValue) => {
                                    // Update with the timestamp in milliseconds
                                    if (newValue) {
                                        onChange(newValue.valueOf()); // Use valueOf() to get timestamp
                                    } else {
                                        onChange(null); // Handle null case
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        error: !!errors.date,
                                        helperText: errors.date?.message,
                                        InputProps: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <CalendarIcon sx={{ color: "action.active" }} />
                                                </InputAdornment>
                                            ),
                                        },
                                    },
                                }}
                                disablePast={true}
                                sx={{ width: '100%' }}
                            />
                        )}
                    />
                </Grid2>
            </>
        </LocalizationProvider>
    );
};

export default DateField;