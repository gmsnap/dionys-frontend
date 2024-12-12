import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, useTheme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { RoomModel } from '@/models/RoomModel';

interface RoomConfiguratorProps {
    sx?: SxProps<Theme>;
}

const RoomConfigurator = ({ sx }: RoomConfiguratorProps) => {
    const [rooms, setRooms] = useState<RoomModel[]>([]);
    const [roomConfiguration, setRoomConfiguration] = useState<RoomConfigurationModel>();
    const [fadeIn, setFadeIn] = useState(false);
    const { eventConfiguration, setEventConfiguration } = useStore();

    const handleConfigurationChange = async (confg: RoomConfigurationModel) => {
        setRoomConfiguration(confg);
    };

    useEffect(() => {
        if (eventConfiguration) {
            setRooms(eventConfiguration.rooms || []);
        }
    }, [eventConfiguration]);

    useEffect(() => {
        // Immediately hide the image and trigger fade-in
        setFadeIn(false); // Hide the image
        const timer = setTimeout(() => setFadeIn(true), 50); // Delay to allow fade-in
        return () => clearTimeout(timer); // Cleanup timeout on unmount or change
    }, [roomConfiguration]);

    if (!eventConfiguration?.room) {
        return <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 8 }}>CONFIGURATOR - ROOM</Typography>
            <Typography variant="h5" sx={{ mt: 4 }}>Bitte Room auswählen</Typography>
        </Box>;
    };

    if (!rooms || rooms.length === 0) {
        return <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 8 }}>CONFIGURATOR - ROOM</Typography>
            <Typography variant="h5" sx={{ mt: 4 }}>Keine Raum-Konfigurationen für diesen Venue gefunden!</Typography>
        </Box>;
    };

    return (
        <Box sx={{ ...sx, mr: 5 }}>
            <Typography variant="h3" sx={{ mb: 8 }}>CONFIGURATOR - ROOM</Typography>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                gap: 5,
                background: 'linear-gradient(to right, #F5F5F5, #FFFFFF)'
            }}>
                {/* Configurations List */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: {
                        xs: '350px', // For extra-small screens
                        sm: '350px',  // For small screens
                        md: '350px',  // For medium screens
                        lg: '350px',  // For large screens
                        xl: '350px',  // For extra-large screens
                    },
                }}>
                    {rooms.map((room) => (
                        room.roomConfigurations.map((roomConf, index) => (
                            <Box
                                key={`${roomConf.id}-${index}`}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFFFFF',
                                    border: roomConfiguration && roomConfiguration.id === roomConf.id ?
                                        '1px solid #A8A8A8' :
                                        '1px solid transparent',
                                    cursor: 'pointer',
                                    mb: 4,
                                }}
                                onClick={() => handleConfigurationChange(roomConf)}
                            >
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
                                    src={roomConf.images[0]}
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
                                        {roomConf.name}
                                    </Typography>
                                    <Box component="ul" sx={{ paddingLeft: 2, margin: 0 }}>
                                        {roomConf.roomItems.map((roomItem: RoomItemModel, index) => (
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
                <Box sx={{
                    flexGrow: 1,
                }}> {roomConfiguration && roomConfiguration.images.length > 0 ?
                    <Box
                        component="img"
                        sx={{
                            width: '100%',
                            objectFit: 'cover',
                            // Fade-in effect
                            opacity: fadeIn ? 1 : 0,
                            // Smooth fade-in only
                            transition: fadeIn ? 'opacity 0.6s ease-out' : 'none',
                        }}
                        src={roomConfiguration.images[1]}
                        alt={'Content Image'}
                    />
                    :
                    <Typography variant="h5" sx={{ mt: 4 }}>Bitte Konfigurationen auswählen.</Typography>
                    }
                </Box>
            </Box>
        </Box >
    );
}

export default RoomConfigurator;