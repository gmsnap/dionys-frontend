import { Box, MenuItem, TextField } from "@mui/material";
import { CircleMinus } from "lucide-react";
import { Controller } from "react-hook-form";
import CustomChip from "./CustomChip";
import { formatEventCategoriesSync } from "@/utils/formatEventCategories";
import { AvailableEventCategories, EventCategories } from "@/constants/EventCategories";

interface ImageUploadFieldProps {
    control: any;
    errors: any;
}

const EventCategoriesField: React.FC<ImageUploadFieldProps> = ({ control, errors }) => {
    return (
        <Controller
            name="eventCategories"
            control={control}
            render={({ field }) => (
                <>
                    {/* Display Selected Categories */}
                    <Box display="flex" flexDirection="column">
                        {(field.value || []).map((category: EventCategories) => (
                            <CustomChip
                                key={category}
                                label={formatEventCategoriesSync([category as EventCategories])}
                                onDelete={() => {
                                    const updatedCategories = (field.value || []).filter(
                                        (item: EventCategories) => item !== category
                                    );
                                    field.onChange(updatedCategories);
                                }}
                                deleteIcon={<CircleMinus />}
                                sx={{
                                    mb: 2,
                                }}
                            />
                        ))}
                    </Box>

                    {/* Categories Dropdown */}
                    <TextField
                        select
                        fullWidth
                        value={field.value || []} // Ensure value is an array
                        onChange={(e) => {
                            const newCategory = e.target.value;
                            field.onChange([...(field.value || []), newCategory]);
                        }}
                        slotProps={{
                            select: {
                                renderValue: () => <Box>Kategorie hinzufügen</Box>,
                                displayEmpty: true,
                            },
                        }}
                        error={!!errors.eventCategories}
                        helperText={errors.eventCategories?.message}
                    >
                        {AvailableEventCategories.filter(
                            (category) => !(field.value || []).includes(category as EventCategories)
                        ).map((category) => (
                            <MenuItem key={category} value={category}>
                                {formatEventCategoriesSync([category as EventCategories])}
                            </MenuItem>
                        ))}
                    </TextField>
                </>
            )}
        />

    );
};

export default EventCategoriesField;