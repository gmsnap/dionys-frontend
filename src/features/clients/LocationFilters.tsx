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
import { ChevronDown, Search, EuroIcon, } from 'lucide-react';
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
        let filters = eventConfigurationFilters || createDefaultFilters();
        setEventConfigurationFilters({
            ...filters,
            city: newCity,
        });
    }

    const handleMinPersonsChange = async (newValue: number | null) => {
        let filters = eventConfigurationFilters || createDefaultFilters();
        if (
            newValue !== null &&
            (filters.maxPersons == null || newValue > filters.maxPersons)
        ) {
            setEventConfigurationFilters({
                ...filters,
                minPersons: newValue,
                maxPersons: newValue,
            });
            return;
        }
        setEventConfigurationFilters({
            ...filters,
            minPersons: newValue,
        });
    }

    const handleMaxPersonsChange = async (newValue: number | null) => {
        let filters = eventConfigurationFilters || createDefaultFilters();
        setEventConfigurationFilters({
            ...filters,
            maxPersons: newValue,
        });
    }

    const handlBudgetChange = async (newValue: number | null) => {
        let filters = eventConfigurationFilters || createDefaultFilters();
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
                gap: 3,
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
                    width: 260,
                    ...inputStyle,
                }}
                popupIcon={<ChevronDown />}
            />

            {/* Min Persons Number Input */}
            <TextField
                placeholder="Min Personen"
                type="number"
                value={eventConfigurationFilters?.minPersons || ""}
                onChange={(event) => {
                    const newValue = event.target.value
                        ? parseInt(event.target.value, 10)
                        : null;
                    handleMinPersonsChange(newValue);
                }}
                sx={smallInputStyle}
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position="end">
                            <Search />
                        </InputAdornment>,
                    },
                }}
            />

            {/* Max Persons Number Input */}
            <TextField
                placeholder="Max Personen"
                type="number"
                value={eventConfigurationFilters?.maxPersons || ""}
                onChange={(event) => {
                    const newValue = event.target.value
                        ? parseInt(event.target.value, 10)
                        : null;
                    if (
                        newValue !== null &&
                        (eventConfigurationFilters?.minPersons == null ||
                            newValue >= eventConfigurationFilters?.minPersons)
                    ) {
                        handleMaxPersonsChange(newValue);
                    }
                }}
                sx={smallInputStyle}
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position="end">
                            <Search />
                        </InputAdornment>,
                    },
                }}
            />

            {/* Currency Input */}
            <TextField
                placeholder="Budget"
                type="number"
                value={eventConfigurationFilters?.budget || ""}
                onChange={(event) => {
                    const newValue = event.target.value ?
                        parseInt(event.target.value, 10) :
                        null;
                    handlBudgetChange(newValue);
                }}
                sx={smallInputStyle}
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position="end">
                            <EuroIcon />
                        </InputAdornment>,
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
