'use client';

import React from 'react';
import {
    Box,
    SxProps,
    Theme,
    TextField,
    InputAdornment,
    Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ChevronDown, EuroIcon, } from 'lucide-react';
import useStore, { createDefaultFilters } from '@/stores/eventStore';
import City from '@/models/City';

interface LocationFiltersProps {
    sx?: SxProps<Theme>;
}

const cities = [
    { label: 'München', value: 'munich' },
    { label: 'Hamburg', value: 'hamburg' },
    { label: 'Berlin', value: 'berlin' },
    { label: 'Frankfurt', value: 'frankfurt' },
    { label: 'Köln', value: 'cologne' },
];

export default function LocationFilters({ sx }: LocationFiltersProps) {
    const { eventConfigurationFilters, setEventConfigurationFilters } = useStore();

    const inputStyle = {
        backgroundColor: '#E8E8E8',
        borderRadius: '8px',
        '& .MuiOutlinedInput-root': {
            height: '42px', // Set the total height
            borderRadius: '8px',
            '& fieldset': {
                border: 'none',
            },
        },
        '& .MuiInputBase-input': {
            fontSize: '20px', // Adjust font size
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
    }

    const handleMinPersonsChange = async (newValue: number | null) => {
        const filters = eventConfigurationFilters || createDefaultFilters();

        if (newValue && newValue < 0) {
            newValue = Math.abs(newValue);
        }

        setEventConfigurationFilters({
            ...filters,
            minPersons: newValue,
        });
    };

    const handlBudgetChange = async (newValue: number | null) => {
        const filters = eventConfigurationFilters || createDefaultFilters();
        setEventConfigurationFilters({
            ...filters,
            budget: newValue,
        });
    }

    return (
        <Box
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
                options={cities}
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
                        xs: '100%', // Full width on extra-small screens
                        sm: '65%',  // 75% width on small screens
                        md: '35%',  // 50% width on medium screens
                        lg: '25%',  // 40% width on large screens and up
                    },
                    maxWidth: '500px',
                    ...inputStyle,
                }}
                popupIcon={<ChevronDown />}
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

            {/* Currency Input */}
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
                    // Parse the user input by removing formatting and extracting the number
                    const userInput = event.target.value.replace(/[^0-9]/g, ""); // Remove all non-digit characters
                    const newValue = userInput ? parseInt(userInput, 10) : null;
                    handlBudgetChange(newValue);
                }}
                sx={smallInputStyle}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <EuroIcon color='black' />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            {/* Date Pickers */}
            {/*<LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="From"
                    slotProps={{
                        textField: {
                            sx: smallInputStyle,
                        },
                    }}
                />

                <DatePicker
                    label="To"
                    slotProps={{
                        textField: {
                            sx: smallInputStyle,
                        },
                    }}
                />
            </LocalizationProvider>*/}
        </Box>
    );
}
