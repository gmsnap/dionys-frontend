import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { Controller } from "react-hook-form";
import { AvailablePriceTypes, PriceTypes } from "@/constants/PriceTypes";
import { translatePrice } from "@/utils/formatPrice";

interface FieldProps {
    control: any;
    errors: any;
}

const PriceTypeField: React.FC<FieldProps> = ({ control, errors }) => {
    return (
        <Controller
            name="priceType"
            control={control}
            render={({ field }) => (
                <FormControl fullWidth error={!!errors.priceType}>
                    <Select
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        displayEmpty
                        defaultValue={AvailablePriceTypes[0]}
                    >
                        {AvailablePriceTypes.map((priceType) => (
                            <MenuItem key={priceType} value={priceType as PriceTypes}>
                                {translatePrice(priceType as PriceTypes)}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.priceType && (
                        <FormHelperText>{errors.priceType.message}</FormHelperText>
                    )}
                </FormControl>
            )}
        />
    );
};

export default PriceTypeField;