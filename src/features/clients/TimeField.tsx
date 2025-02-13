import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Grid2, InputAdornment, Typography } from "@mui/material";
import { DesktopTimePicker, LocalizationProvider, TimeIcon, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface TimeFieldProps {
    control: any;
    fieldName: any;
    errors: any;
    labelText: string;
    labelWidth: number;
}

const TimeField: React.FC<TimeFieldProps> = ({ control, fieldName, errors, labelText, labelWidth }) => {
    const [open, setOpen] = useState(false)

    const handleAdornmentClick = () => {
        setOpen(true);
    };

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
                                open={open}
                                onOpen={() => setOpen(true)}
                                onClose={() => setOpen(false)}
                                slotProps={{
                                    textField: {
                                        variant: "outlined",
                                        error: !!errors[fieldName],
                                        helperText: errors[fieldName]?.message,
                                        InputProps: {
                                            endAdornment: (
                                                <InputAdornment
                                                    position="end"
                                                    sx={{
                                                        cursor: "pointer",
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                        },
                                                    }}
                                                    onClick={handleAdornmentClick}
                                                >
                                                    <TimeIcon sx={{ color: "action.active" }} />
                                                </InputAdornment>
                                            ),
                                        },
                                    },
                                }}
                                ampm={false}
                                timeSteps={{ hours: 1, minutes: 15 }}
                                minutesStep={15}
                                sx={{ width: '100%' }}
                            />
                        )}
                    />
                </Grid2>
            </>
        </LocalizationProvider >
    );
};

export default TimeField;
