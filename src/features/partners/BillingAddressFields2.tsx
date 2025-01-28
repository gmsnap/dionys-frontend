import React from "react";
import { Controller } from "react-hook-form";
import { TextField, Grid2, Typography } from "@mui/material";

interface BillingAddressFieldsProps {
    formData: any;
}

const BillingAddressFields = ({ formData }: BillingAddressFieldsProps) => {
    const fields = [
        { name: "billingAddress.city", label: "Stadt", value: formData.billingAddress?.city || "" },
        { name: "billingAddress.streetAddress", label: "Straße", value: formData.billingAddress?.streetAddress || "" },
        { name: "billingAddress.postalCode", label: "Postleitzahl", value: formData.billingAddress?.postalCode || "" },
        { name: "billingAddress.country", label: "Land", value: formData.billingAddress?.country || "" },
    ];

    return (
        <>
            {fields.map((field, index) => (
                <Grid2 key={index} size={{ xs: 12, sm: 10 }} container alignItems="top" spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="label">{field.label}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name={field.name}
                            defaultValue={field.value}
                            render={({ field: controllerField, fieldState: { error } }) => (
                                <TextField
                                    {...controllerField}
                                    fullWidth
                                    variant="outlined"
                                    error={!!error}
                                    helperText={error?.message}
                                />
                            )}
                        />
                    </Grid2>
                </Grid2>
            ))}
        </>
    );
};

export default BillingAddressFields;
