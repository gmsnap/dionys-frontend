import React from "react";
import { Controller } from "react-hook-form";
import { Grid2, Typography, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface TimeFieldProps {
    control: any;
    fieldName: any;
    labelText: string;
    labelWidth: number;
}

const TimeField: React.FC<TimeFieldProps> = ({ control, fieldName, labelText, labelWidth }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'de'}>
            <>
                <Grid2 size={{ sm: labelWidth }}>
                    <Typography variant="label">{labelText}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                    <Controller
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value, ...restField } }) => (
                            <TimePicker
                                {...restField}
                                value={value ? dayjs(value) : null}
                                onChange={(newTime) => {
                                    if (newTime) {
                                        // Update only the time portion while preserving the current date
                                        // Preserve existing date
                                        const updatedDate = new Date(value);
                                        // Set new time
                                        updatedDate.setHours(newTime.hour(), newTime.minute(), newTime.second(), 0);
                                        // Pass the updated timestamp back
                                        onChange(updatedDate.getTime());
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
            </>
        </LocalizationProvider >
    );
};

export default TimeField;
