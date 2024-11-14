import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, useTheme, CircularProgress, Typography, Button } from '@mui/material';
import useStore from '@/stores/eventStore';
import { formatEventCategories } from '@/utils/formatEventCategories';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import Venues from './Venues';

interface EventConfiguratorProps {
    locationId: number;
    sx?: SxProps<Theme>;
}

const ConfiguratorNavItem = ({
    index,
    label,
    value,
    selected,
    onSelect }: {
        index: number;
        label: string;
        value: string;
        selected: boolean;
        onSelect: () => void
    }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2, mb: 2 }}>
            <Box sx={{ width: '30px' }}>
                {/* Number Button */}
                <Button variant="outlined" sx={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '-0.05em',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    minWidth: 0,
                    padding: 0,
                    backgroundColor: selected ? '#DE33C4' : '#FFFFFF',
                    color: selected ? '#FFFFFF' : '#000000',
                }}
                    onClick={onSelect}
                >
                    {index}
                </Button>
            </Box>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
                <Typography variant='body2' sx={{ fontSize: '14px' }}>{label} {value}</Typography>
            </Box>
        </Box>
    )
};

const EventConfigurator = ({ locationId, sx }: EventConfiguratorProps) => {
    const navItems = ['Anlass: ', 'Personen: ', 'Venue', 'Configurator', 'Summary'];
    const [selectedItem, setSelectedItem] = useState(0);
    const { location, eventConfiguration, setEventConfiguration } = useStore();

    const handleSelect = (index: number) => {
        setSelectedItem(index);
    }

    // Initialize the configuration model if it doesn't exist
    useEffect(() => {
        if (!eventConfiguration || eventConfiguration.locationId !== locationId) {
            // Set the default event configuration if it's not already set
            setEventConfiguration(createDefaultEventConfigurationModel(locationId));
            console.log("UP");
        }
    }, [eventConfiguration, locationId]);

    return (
        <Box sx={{ ...sx, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Box sx={{ width: '100%', height: '100%' }}>
                {selectedItem === 0 &&
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h3">ANLASS</Typography>
                        <Typography variant="h6">{eventConfiguration &&
                            formatEventCategories(eventConfiguration.occasion)}</Typography>
                    </Box>}
                {selectedItem === 1 &&
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h3">PERSONEN</Typography>
                    </Box>}
                {selectedItem === 2 &&
                    <Venues sx={{ height: '100%', mt: 4 }} />}
            </Box>
            {/* Configurator Navigation */}
            <Box sx={{
                backgroundColor: '#F5F5F5',
                borderTopLeftRadius: '16px',
                borderBottomLeftRadius: '16px',
                minWidth: '300px',
                height: 'fit-content',
                padding: 4,
                mt: 4
            }}>
                <Typography variant="h3">{eventConfiguration ? eventConfiguration.venueId.toString() : ''}</Typography>
                {navItems.map((item, index) => {
                    let value: string;

                    switch (index) {
                        case 0:
                            value = eventConfiguration ? formatEventCategories(eventConfiguration.occasion) : '';
                            break;
                        case 1:
                            value = eventConfiguration ? eventConfiguration.persons.toString() : '';
                            break;
                        default:
                            value = "";
                            break;
                    }

                    return <ConfiguratorNavItem
                        key={index}
                        index={index}
                        label={item}
                        value={value}
                        selected={selectedItem === index}
                        onSelect={() => handleSelect(index)}
                    />
                })}
            </Box>
        </Box>
    )
};

function createDefaultEventConfigurationModel(locationId: number): EventConfigurationModel {
    return {
        locationId: locationId,
        venueId: 0,
        venue: null,
        occasion: ["business"],
        persons: 50,
    };
}

export default EventConfigurator;