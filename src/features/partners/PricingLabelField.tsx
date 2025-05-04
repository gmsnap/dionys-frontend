import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { Controller } from "react-hook-form";
import { AvailablePricingLabels, PricingLabels } from "@/constants/PriceTypes";
import { translatePricingLabel } from "@/utils/formatPrice";

interface FieldProps {
    control: any;
    errors: any;
}

const PricingLabelField: React.FC<FieldProps> = ({ control, errors }) => {
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
                        {AvailablePricingLabels.map((pricingLabel) => (
                            <MenuItem key={pricingLabel} value={pricingLabel as PricingLabels}>
                                {translatePricingLabel(pricingLabel as PricingLabels)}
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