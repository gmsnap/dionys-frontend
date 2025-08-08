import React, { useState } from "react"
import { TextField } from "@mui/material"
import { Controller } from "react-hook-form"

interface PriceInputProps {
    control: any;
    errors: any;
}

const PriceInput = ({ control, errors }: PriceInputProps) => {
    const [inputValue, setInputValue] = useState<string>('');

    return (
        <Controller
            name="price"
            control={control}
            render={({ field }) => {
                const isEmpty =
                    field.value === null ||
                    field.value === undefined ||
                    field.value === '';

                // Use inputValue for display during typing, otherwise format the field.value
                const displayValue = inputValue !== ''
                    ? inputValue
                    : isEmpty
                        ? ''
                        : new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(Number(field.value));

                return (
                    <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        placeholder="inklusive"
                        value={displayValue}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^\d,]/g, ""); // Allow digits and comma
                            setInputValue(rawValue); // Update local input value
                            field.onChange(rawValue); // Store raw string in form state
                        }}
                        slotProps={{
                            input: {
                                onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                                    const rawValue = e.target.value
                                        .replace(/[^\d,]/g, "")
                                        .replace(/,/, "."); // Normalize to period
                                    const numericValue = parseFloat(rawValue);
                                    if (!isNaN(numericValue)) {
                                        field.onChange(Number(numericValue.toFixed(2))); // Store number
                                        setInputValue(''); // Reset input value to show formatted currency
                                    } else {
                                        field.onChange(""); // Reset invalid values
                                        setInputValue(''); // Clear input value
                                    }
                                },
                            },
                        }}
                    />
                );
            }}
        />
    );
};

export default PriceInput;