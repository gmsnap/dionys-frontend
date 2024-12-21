import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Grid2, CircularProgress, Button } from '@mui/material';
import GridItem from '@/components/GridItem';
import { formatPrice } from '@/utils/formatPrice';
import { Pencil, User, X } from 'lucide-react';
import GridAddItem from '@/components/GridAddItem';
import Link from 'next/link';
import { RoomModel } from '@/models/RoomModel';
import { handleDeleteRoom } from '@/services/roomService';
import useStore from '@/stores/partnerStore';
import router from 'next/router';
import NoLocationMessage from './NoLocationMessage';
import { fetchLocationWithRooms, useSetLocationByCurrentPartner } from '@/services/locationService';

interface RoomGridProps {
    sx?: SxProps<Theme>;
}

const RoomGrid = ({ sx }: RoomGridProps) => {
    const { partnerLocation } = useStore();

    const [rooms, setRooms] = useState<RoomModel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useSetLocationByCurrentPartner();

    const fetchRoomsFromApi = async () => {
        if (partnerLocation?.id) {
            const location = await fetchLocationWithRooms(
                partnerLocation.id,
                setIsLoading,
                setError
            );

            setIsLoading(false);

            if (!location) {
                setRooms([]);
                setError("No Location found");
                return;
            }

            const roomsResult = location.rooms;
            if (roomsResult) {
                // Set rooms to state
                setRooms(roomsResult);
                setError(null);
                return;
            }
        }
        setRooms([]);
        setError("Error fetching rooms");
    };

    useEffect(() => {
        fetchRoomsFromApi();
    }, [partnerLocation]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (partnerLocation === null) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <NoLocationMessage />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <div>{error}</div>
            </Box>
        );
    }

    return (
        <Grid2 container spacing={5} alignItems="stretch" sx={{ ...sx }}>
            {rooms.map((room) => (
                <Grid2 key={room.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                    <GridItem
                        id={room.id}
                        image={room.images[0]}
                        title={room.name}
                        priceTag={`Ab ${formatPrice(room.price)} / Tag`}
                        listItems={[{
                            icon: <User />,
                            label: `${room.minPersons}-${room.maxPersons}`
                        }]}
                        buttons={[
                            <Button
                                key={`${room.id}-1`}
                                variant="outlined"
                                color="primary"
                                component={Link}
                                href={`/partner/rooms/edit/${room.id}`}
                                sx={{
                                    flex: 1,
                                    '&:hover': {
                                        borderColor: '#000000',
                                        backgroundColor: '#000000',
                                        color: '#ffffff',
                                    },
                                    '.icon': {
                                        color: '#000000',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                    lineHeight: 0,
                                }}
                            >
                                Edit
                                <Box
                                    component="span" sx={{ ml: 1, }}
                                >
                                    <Pencil className="icon" width={12} height={12} />
                                </Box>
                            </Button>,
                            <Button
                                key={`${room.id}-2`}
                                variant="outlined"
                                sx={{
                                    flex: 1,
                                    color: '#ff0000',
                                    borderColor: '#ff0000',
                                    '&:hover': {
                                        borderColor: '#ff0000',
                                        backgroundColor: '#ff0000',
                                        color: '#ffffff',
                                    },
                                    '.icon': {
                                        color: '#ff0000',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                    lineHeight: 0,
                                }}
                                onClick={
                                    () => handleDeleteRoom(room.id, () => fetchRoomsFromApi())
                                }
                            >
                                Delete
                                <Box component="span" sx={{ ml: 1 }}>
                                    <X className="icon" width={16} height={16} />
                                </Box>
                            </Button>,
                        ]}
                    />
                </Grid2>
            ))}
            <Grid2 key={-1} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} display="flex">
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <GridAddItem
                        id={-1}
                        handler={() => { router.push('/partner/rooms/edit/0'); }}
                        sx={{ flex: 1, height: '100%' }}
                    />
                </Box>
            </Grid2>
        </Grid2>
    );
};

export default RoomGrid;