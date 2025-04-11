import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Grid2, InputAdornment, Typography } from "@mui/material";
import { DesktopTimePicker, LocalizationProvider, TimeIcon } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface TimeFieldProps {
    control: any;
    fieldName: string; // Changed from any to string for better typing
    errors: any;
    labelText: string;
    labelWidth: number;
    inputRef?: React.RefObject<HTMLInputElement>; // Added inputRef prop
    onKeyDown?: (e: React.KeyboardEvent) => void; // Added onKeyDown prop
}

const TimeField: React.FC<TimeFieldProps> = ({
    control,
    fieldName,
    errors,
    labelText,
    labelWidth,
    inputRef,
    onKeyDown
}) => {
    const [open, setOpen] = useState(false);

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
                            <DesktopTimePicker
                                {...restField}
                                value={value ? dayjs(value) : null}
                                onChange={(newTime) => {
                                    if (newTime) {
                                        // Update only the time portion while preserving the current date
                                        const updatedDate = new Date(value || Date.now()); // Fallback to now if no value
                                        updatedDate.setHours(newTime.hour(), newTime.minute(), newTime.second(), 0);
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
                                        inputRef: inputRef, // Pass inputRef to the underlying TextField
                                        onKeyDown: onKeyDown, // Pass onKeyDown to the underlying TextField
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
        </LocalizationProvider>
    );
};

export default TimeField;