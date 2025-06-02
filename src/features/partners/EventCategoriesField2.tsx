import { useEffect, useState } from "react";
import { Checkbox, FormControl, FormHelperText, ListItemText, MenuItem, Select } from "@mui/material";
import { Controller } from "react-hook-form";
import { formatEventCategoriesSync } from "@/utils/formatEventCategories";
import { AvailableEventCategories, EventCategories } from "@/constants/EventCategories";

interface Props {
    control: any;
    errors: any;
}

const EventCategoriesField2: React.FC<Props> = ({ control, errors }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false); // Close the menu on scroll
            }
        };

        // Add scroll event listener to the window or a specific scrollable container
        window.addEventListener("scroll", handleScroll);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isMenuOpen]);

    return (
        <Controller
            name="eventCategories"
            control={control}
            render={({ field }) => (
                <>
                    {/* Categories Dropdown */}
                    <FormControl fullWidth error={!!errors.eventCategories}>
                        <Select
                            multiple
                            displayEmpty
                            value={field.value || []}
                            onChange={(e) => field.onChange(e.target.value)}
                            open={isMenuOpen}
                            onOpen={() => setIsMenuOpen(true)}
                            onClose={() => setIsMenuOpen(false)}
                            renderValue={(selected) => {
                                if (!selected || selected.length === 0) {
                                    return <em>Kategorie hinzufügen</em>;
                                }
                                return selected
                                    .map((category: EventCategories) => formatEventCategoriesSync([category]))
                                    .filter(Boolean)
                                    .join(", ");
                            }}
                            MenuProps={{
                                disablePortal: true,
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                },
                            }}
                        >
                            {AvailableEventCategories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    <Checkbox
                                        color="secondary"
                                        checked={field.value?.includes(category as EventCategories) || false}
                                    />
                                    <ListItemText primary={formatEventCategoriesSync([category as EventCategories])} />
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.eventCategories?.message}</FormHelperText>
                    </FormControl>
                </>
            )}
        />
    );
};

export default EventCategoriesField2;