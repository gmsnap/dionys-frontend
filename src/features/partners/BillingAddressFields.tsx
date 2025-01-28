import { Grid2, TextField, Typography } from "@mui/material";

interface Props {
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BillingAddressFields = ({ formData, handleChange }: Props) => {
    return (
        <>
            <Grid2 size={{ xs: 12 }}>
                <Grid2 container alignItems="top">
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="label">Straße, Nr.</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <TextField
                            name="billingAddress.streetAddress"
                            value={formData.billingAddress.streetAddress}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid2>
                </Grid2>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
                <Grid2 container alignItems="top">
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="label">Stadt</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <TextField
                            name="billingAddress.city"
                            value={formData.billingAddress.city}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid2>
                </Grid2>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
                <Grid2 container alignItems="top">
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="label">PLZ</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <TextField
                            name="billingAddress.postalCode"
                            value={formData.billingAddress.postalCode}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid2>
                </Grid2>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
                <Grid2 container alignItems="top">
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <Typography variant="label">Land</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 8 }}>
                        <TextField
                            name="billingAddress.country"
                            value={formData.billingAddress.country}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid2>
                </Grid2>
            </Grid2>
        </>
    );
};

export default BillingAddressFields;