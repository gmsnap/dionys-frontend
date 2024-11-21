import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, useTheme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';

interface RoomConfiguratorProps {
    sx?: SxProps<Theme>;
}

const RoomConfigurator = ({ sx }: RoomConfiguratorProps) => {
    const theme = useTheme();
    const [rooms, setRooms] = useState<RoomModel[]>([]);
    const { eventConfiguration, setEventConfiguration } = useStore();

    // Function to handle updating the venueId
    const handleVenueChange = (newVenueId: number) => {
        if (eventConfiguration) {
            setEventConfiguration({ ...eventConfiguration, venueId: newVenueId });
        }
    };

    useEffect(() => {
        if (eventConfiguration) {
            setRooms(eventConfiguration.rooms || []);
        }
    }, [eventConfiguration]);

    if (!eventConfiguration?.venue) {
        return <Typography variant="h6" sx={{ mb: 4 }}>Please select Venue</Typography>;
    };

    if (!rooms || rooms.length === 0) {
        return <Typography variant="h6" sx={{ mb: 4 }}>No Rooms</Typography>;
    };

    return (
        <Box sx={{ ...sx, backgroundColor: 'yellow' }}>
            <Typography variant="h3" sx={{ mb: 4 }}>CONFIGURATOR - ROOM</Typography>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
            }}>
                {/* Configurations List */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: {
                        xs: '40%', // For extra-small screens
                        sm: '30%',  // For small screens
                        md: '30%',  // For medium screens
                        lg: '20%',  // For large screens
                        xl: '20%',  // For extra-large screens
                    },
                }}>
                    {rooms.map((room) => (
                        room.roomConfigurations.map((roomConfiguration, index) => (
                            <Box key={`${roomConfiguration.id}-${index}`}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    borderTopRightRadius: '8px',
                                    borderBottomRightRadius: '8px',
                                    backgroundColor: '#FFFFFF',
                                    mb: 4,
                                }}>
                                {/* Configuration Image */}
                                <Box
                                    component="img"
                                    sx={{
                                        borderRadius: '8px',
                                        maxWidth: '183px', // Set maximum width for the image
                                        height: '105px',
                                        objectFit: 'cover', // Maintain aspect ratio and crop overflow
                                        flexShrink: 0, // Prevent the image from shrinking
                                    }}
                                    src={roomConfiguration.images[0]}
                                    alt={"No Image"}
                                />
                                <Box sx={{
                                    width: '100%',
                                    padding: 2,
                                }}>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',      // Prevent line breaks
                                            overflow: 'hidden',        // Hide overflowing text
                                            textOverflow: 'ellipsis',  // Add ellipsis (...) to overflowing text
                                        }}
                                    >
                                        {roomConfiguration.name}
                                    </Typography>
                                    <Box component="ul" sx={{ paddingLeft: 2, margin: 0 }}>
                                        {roomConfiguration.roomItems.map((roomItem: RoomItemModel, index) => (
                                            <Box component="li" key={index} sx={{ fontSize: '12px', listStyleType: 'disc' }}>
                                                {roomItem.quantity} {roomItem.name}{roomItem.quantity > 1 ? 's' : ''}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    ))}
                </Box>
                {/* Configuration Content (large image) */}
                <Box sx={{ flexGrow: 1, backgroundColor: 'red', borderRadius: '16px' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        CONTENT
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default RoomConfigurator;