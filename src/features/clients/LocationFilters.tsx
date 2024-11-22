'use client';

import React, { useState } from 'react';
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

interface LocationFiltersProps {
    sx?: SxProps<Theme>;
}

interface City {
    label: string;
    value: string;
}

const cities = [
    { label: 'München', value: 'munich' },
    { label: 'Hamburg', value: 'hamburg' },
    { label: 'Berlin', value: 'berlin' },
    { label: 'Frankfurt', value: 'frankfurt' },
    { label: 'Köln', value: 'cologne' },
];

export default function LocationFilters({ sx }: LocationFiltersProps) {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

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
                value={selectedCity}
                onChange={(event, newValue: City | null) => setSelectedCity(newValue)}
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

            {/* TextField with Number Input */}
            <TextField
                placeholder="Min Personen"
                type="number"
                sx={smallInputStyle}
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position="end">
                            <Search />
                        </InputAdornment>,
                    },
                }}
            />

            <TextField
                placeholder="Max Personen"
                type="number"
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
