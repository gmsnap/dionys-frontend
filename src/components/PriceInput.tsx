import React from "react"
import { TextField } from "@mui/material"
import { Controller } from "react-hook-form"

interface PriceInputProps {
    control: any;
    errors: any;
}

const PriceInput = ({ control, errors }: PriceInputProps) => {
    return (
        <Controller
            name="price"
            control={control}
            render={({ field }) => (
                <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    value={
                        field.value !== undefined && field.value !== null
                            ? typeof field.value === "number"
                                ? new Intl.NumberFormat("de-DE", {
                                    style: "currency",
                                    currency: "EUR",
                                }).format(field.value)
                                : field.value // Keep raw value during typing
                            : ""
                    }
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d,.-]/g, ""); // Allow only numeric inputs
                        field.onChange(rawValue); // Update the field with raw input
                    }}
                    slotProps={{
                        input: {
                            onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                                const rawValue = e.target.value.replace(",", ".");
                                const numericValue = parseFloat(rawValue); // Parse numeric value
                                if (!isNaN(numericValue)) {
                                    field.onChange(numericValue); // Save number in form state
                                } else {
                                    field.onChange(""); // Reset invalid values
                                }
                            },
                        },
                    }}
                />
            )}
        />
    )
};

export default PriceInput;