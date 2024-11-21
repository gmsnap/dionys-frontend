import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Typography, Button } from '@mui/material';
import useStore from '@/stores/eventStore';
import { formatEventCategories } from '@/utils/formatEventCategories';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import Venues from './Venues';
import RoomConfigurator from './RoomConfigurator';

interface EventConfiguratorProps {
    locationId: number;
    sx?: SxProps<Theme>;
}

// Props interface with a recursive type for subItems
interface ConfiguratorNavItemProps {
    index: number;
    label: string;
    value: string;
    subItems: ConfiguratorNavItemProps[] | null;
    isSubitem: boolean | false;
    selected: boolean;
    onSelect: () => void;
}

const ConfiguratorNavItem: React.FC<ConfiguratorNavItemProps> = ({
    index,
    label,
    value,
    subItems,
    isSubitem,
    selected,
    onSelect
}) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                {/* Number Button */}
                <Box sx={{ width: '30px', display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        sx={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.05em',
                            borderRadius: '50%',
                            borderColor: '#8E8D83',
                            borderWidth: selected ? 0 : 0.1,
                            width: 28,
                            height: 28,
                            minWidth: 0,
                            padding: 0,
                            backgroundColor: selected ? '#DE33C4' : '#FFFFFF',
                            color: selected ? '#FFFFFF' : '#000000',
                        }}
                        onClick={onSelect}
                    >
                        {index + 1}
                    </Button>
                </Box>
                {/* Label */}
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography variant='body2'
                        sx={{
                            fontSize: isSubitem ? '13px' : '16px',
                            fontWeight: selected ? 700 : 400,
                            color: '#212020',
                        }}>
                        {label}{value && `: ${value}`}
                    </Typography>
                </Box>
            </Box>
            {subItems && subItems.length > 0 && (
                <Box sx={{ ml: 4 }}>
                    {subItems.map((subItem, subIndex) => (
                        <ConfiguratorNavItem
                            key={subIndex}
                            {...subItem}
                            index={subIndex}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

const EventConfigurator = ({ locationId, sx }: EventConfiguratorProps) => {
    const navItems = [
        { label: 'Anlass', subItems: null },
        { label: 'Personen', subItems: null },
        { label: 'Venue', subItems: null },
        { label: 'Configurator', subItems: ['Room Configurator', 'Service Configurator'] },
        { label: 'Summary', subItems: null }];
    const [selectedItem, setSelectedItem] = useState(0);
    const [selectedConfiguratorItem, setSelectedConfiguratorItem] = useState(-1);
    const { eventConfiguration, setEventConfiguration } = useStore();
    const [translatedCategories, setTranslatedCategories] = useState<string>('');

    const handleSelect = (index: number) => {
        setSelectedItem(index);
    };

    const handleConfiguratorSelect = (index: number) => {
        setSelectedConfiguratorItem(index);
    };

    // Initialize the configuration model if it doesn't exist
    useEffect(() => {
        if (!eventConfiguration || eventConfiguration.locationId !== locationId) {
            setEventConfiguration(createDefaultEventConfigurationModel(locationId));

            const fetchFormattedCategories = async () => {
                if (eventConfiguration?.occasion) {
                    const result = await formatEventCategories(eventConfiguration.occasion);
                    setTranslatedCategories(result);
                }
            };
            fetchFormattedCategories();
        }
    }, [eventConfiguration, setEventConfiguration, locationId]);

    // Fetch and translate categories
    useEffect(() => {
        const fetchFormattedCategories = async () => {
            if (eventConfiguration?.occasion) {
                const result = await formatEventCategories(eventConfiguration.occasion);
                setTranslatedCategories(result);
            }
        };
        fetchFormattedCategories();
    }, [eventConfiguration]);

    useEffect(() => {
        if (selectedItem === 3 && selectedConfiguratorItem === -1) {
            handleConfiguratorSelect(0);
        }
    }, [selectedItem]);

    return (
        <Box sx={{ ...sx, display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
                {selectedItem === 0 &&
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h3">ANLASS</Typography>
                        <Typography variant="h6">{translatedCategories}</Typography>
                    </Box>}
                {selectedItem === 1 &&
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h3">PERSONEN</Typography>
                    </Box>}
                {selectedItem === 2 &&
                    <Venues sx={{ height: '100%', mt: 4 }} />}
                {selectedItem === 3 &&
                    <Box sx={{ mt: 4 }}>
                        {selectedConfiguratorItem === 0 && <RoomConfigurator />}
                        {selectedConfiguratorItem === 1 &&
                            <Typography variant="h3">CONFIGURATOR - SERVICES</Typography>}
                    </Box>}
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
                {/* <Typography variant="h3">{eventConfiguration ? eventConfiguration.venueId.toString() : ''}</Typography> */}
                {navItems.map((item, index) => {
                    let value: string;
                    let subItems: ConfiguratorNavItemProps[] = [];

                    switch (index) {
                        case 0:
                            value = translatedCategories;
                            break;
                        case 1:
                            value = eventConfiguration ? eventConfiguration.persons.toString() : '';
                            break;
                        case 2:
                            value = eventConfiguration && eventConfiguration.venue
                                ? eventConfiguration.venue.title : '';
                            break;
                        default:
                            value = "";
                            break;
                    }

                    if (item.subItems) {
                        const menuItems = item.subItems.map((label, index) => ({
                            index: index,
                            label,
                            value: '',
                            subItems: null,
                            isSubitem: true,
                            selected: selectedConfiguratorItem === index,
                            onSelect: () => handleConfiguratorSelect(index),
                        }));

                        subItems.push(...menuItems);
                    }

                    return <ConfiguratorNavItem
                        key={index}
                        index={index}
                        label={item.label}
                        value={value}
                        subItems={subItems}
                        isSubitem={false}
                        selected={selectedItem === index}
                        onSelect={() => handleSelect(index)}
                    />;
                })}
            </Box>
        </Box>
    );
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
