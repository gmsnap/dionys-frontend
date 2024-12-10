import React, { useRef } from 'react';
import {
    Box,
    SxProps,
    Theme,
    TextField,
    InputAdornment,
    Autocomplete,
} from '@mui/material';
import { ChevronDown, EuroIcon } from 'lucide-react';
import useStore, { createDefaultFilters } from '@/stores/eventStore';
import City, { AvailableCities } from '@/models/City';

interface LocationFiltersProps {
    sx?: SxProps<Theme>;
}

export default function LocationFilters({ sx }: LocationFiltersProps) {
    const { eventConfigurationFilters, setEventConfigurationFilters } = useStore();

    const autocompleteRef = useRef<HTMLDivElement>(null); // Ref for Autocomplete
    const lastInputRef = useRef<HTMLInputElement>(null); // Ref for the last input field

    const inputStyle = {
        backgroundColor: '#E8E8E8',
        borderRadius: '8px',
        '& .MuiOutlinedInput-root': {
            height: '42px',
            borderRadius: '8px',
            '& fieldset': {
                border: 'none',
            },
        },
        '& .MuiInputBase-input': {
            fontSize: '20px',
        },
    };

    const smallInputStyle = {
        ...inputStyle,
    };

    const handleCityChange = async (newCity: City | null) => {
        const filters = eventConfigurationFilters || createDefaultFilters();
        setEventConfigurationFilters({
            ...filters,
            city: newCity,
        });
    };

    const handleMinPersonsChange = async (newValue: number | null) => {
        const filters = eventConfigurationFilters || createDefaultFilters();
        setEventConfigurationFilters({
            ...filters,
            minPersons: newValue,
        });
    };

    const handleBudgetChange = async (newValue: number | null) => {
        const filters = eventConfigurationFilters || createDefaultFilters();
        setEventConfigurationFilters({
            ...filters,
            budget: newValue,
        });
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === autocompleteRef.current) {
                // Shift + Tab from the first element: Loop back to the last input
                event.preventDefault();
                lastInputRef.current?.focus();
            } else if (!event.shiftKey && document.activeElement === lastInputRef.current) {
                // Tab from the last element: Loop back to the first input
                event.preventDefault();
                autocompleteRef.current?.focus();
            }
        }
    };

    return (
        <Box
            onKeyDown={handleKeyDown}
            sx={{
                ...sx,
                display: 'flex',
                flexDirection: 'row',
                gap: 5,
                justifyContent: 'space-between',
                mb: 4,
            }}
        >
            {/* City Select */}
            <Autocomplete
                options={AvailableCities}
                value={eventConfigurationFilters?.city || null}
                onChange={(_event, newValue: City | null) => handleCityChange(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Stadt eingeben"
                        sx={inputStyle}
                    />
                )}
                sx={{
                    width: {
                        xs: '100%',
                        sm: '65%',
                        md: '35%',
                        lg: '25%',
                    },
                    maxWidth: '500px',
                    ...inputStyle,
                }}
                popupIcon={<ChevronDown />}
                ref={autocompleteRef} // Reference to the first input
            />

            {/* Min Persons Number Input */}
            <TextField
                placeholder="Personen"
                type="number"
                value={eventConfigurationFilters?.minPersons || ""}
                onChange={(event) => {
                    const newValue = event.target.value
                        ? parseInt(event.target.value, 10)
                        : null;
                    handleMinPersonsChange(newValue);
                }}
                sx={smallInputStyle}
            />

            {/* Budget Input */}
            <TextField
                placeholder="Budget"
                value={
                    eventConfigurationFilters?.budget != null
                        ? new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                        }).format(eventConfigurationFilters.budget)
                        : ""
                }
                onChange={(event) => {
                    const userInput = event.target.value.replace(/[^0-9]/g, "");
                    const newValue = userInput ? parseInt(userInput, 10) : null;
                    handleBudgetChange(newValue);
                }}
                sx={smallInputStyle}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <EuroIcon color="black" />
                            </InputAdornment>
                        ),
                    },
                }}
                inputRef={lastInputRef} // Reference to the last input
            />
        </Box>
    );
}
