import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { Controller } from "react-hook-form";
import { AvailablePricingLabels, FormatPrice } from "@/utils/pricingManager";

interface FieldProps {
    control: any;
    errors: any;
    labels?: string[];
}

const PricingLabelField: React.FC<FieldProps> = ({ control, errors, labels }) => {
    return (
        <Controller
            name="pricingLabel"
            control={control}
            render={({ field }) => (
                <FormControl fullWidth error={!!errors.pricingLabel}>
                    <Select
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        displayEmpty
                        defaultValue={AvailablePricingLabels[0]}
                    >
                        {(labels ?? AvailablePricingLabels).map((pricingLabel) => (
                            <MenuItem key={pricingLabel} value={pricingLabel}>
                                {FormatPrice.translate(pricingLabel)}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.pricingLabel && (
                        <FormHelperText>{errors.pricingLabel.message}</FormHelperText>
                    )}
                </FormControl>
            )}
        />
    );
};

export default PricingLabelField;