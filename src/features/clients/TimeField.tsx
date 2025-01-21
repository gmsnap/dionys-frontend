import React from "react";
import { Controller } from "react-hook-form";
import { Grid2, Typography, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface TimeFieldProps {
    control: any;
    errors: any;
    labelWidth: number;
}

const TimeField: React.FC<TimeFieldProps> = ({ control, errors, labelWidth }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
            <Grid2 container alignItems="top">
                <Grid2 size={{ sm: labelWidth }}>
                    <Typography variant="label">Uhrzeit</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field: { onChange, value, ...restField } }) => (
                            <TimePicker
                                {...restField}
                                value={value ? dayjs(value) : null}
                                onChange={(newTime) => {
                                    if (newTime) {
                                        // Update only the time portion while preserving the current date
                                        const updatedDate = new Date(value); // Preserve existing date
                                        updatedDate.setHours(newTime.hour(), newTime.minute(), newTime.second(), 0); // Set new time
                                        onChange(updatedDate.getTime()); // Pass the updated timestamp back
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                    },
                                }}
                            />
                        )}
                    />
                </Grid2>
            </Grid2>
        </LocalizationProvider >
    );
};

export default TimeField;
