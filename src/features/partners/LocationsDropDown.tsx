import React from 'react';
import { Box, Select, MenuItem, SelectChangeEvent, Typography } from '@mui/material';

interface Location {
    id: number;
    title: string;
}

interface LocationSelectorProps {
    partnerLocations: Location[] | null;
    locationId: number | null;
    onLocationChange?: (locationId: number) => void;
}

const LocationsDropDown: React.FC<LocationSelectorProps> = ({
    partnerLocations,
    locationId,
    onLocationChange
}) => {
    const handleChange = (event: SelectChangeEvent<number>) => {
        onLocationChange?.(event.target.value as number);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
            }}
        >
            <Typography
                sx={{
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    mr: { xs: 0, sm: 1 },
                }}
            >Location / Venue:</Typography>
            {partnerLocations && partnerLocations.length > 0 && (
                <Select
                    value={locationId || ''}
                    onChange={handleChange}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value="">
                        <em>Alle Locations</em>
                    </MenuItem>
                    {partnerLocations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                            {location.title}
                        </MenuItem>
                    ))}
                </Select>
            )}
        </Box>
    );
};

export default LocationsDropDown;