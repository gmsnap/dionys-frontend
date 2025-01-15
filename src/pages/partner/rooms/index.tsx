import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import RoomGrid from '@/features/partners/RoomGrid';
import useStore from '@/stores/partnerStore';
import LocationsDropDown from '@/features/partners/LocationsDropDown';
import theme from '@/theme';
import { RoomModel } from '@/models/RoomModel';
import { fetchLocationWithRooms } from '@/services/locationService';
import { fetchRoomsByCompany } from '@/services/roomService';
import RoomForm from '@/features/partners/RoomForm';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser, partnerLocations } = useStore();
    const [locationId, setLocationId] = useState<number | null>(null);
    const [roomId, setRoomId] = useState<number | null>(null);
    const [rooms, setRooms] = useState<RoomModel[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchRoomsFromApi = async () => {
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }

        const rooms = locationId ?
            (await fetchLocationWithRooms(
                locationId,
                setIsLoading,
                setError
            ))?.rooms :
            await fetchRoomsByCompany(
                companyId,
                setIsLoading,
                setError
            );

        if (!rooms) {
            setRooms([]);
            setError("Error fetching rooms");
            return;
        }

        // Set rooms to state
        setRooms(rooms);
        setError(null);
    };

    useEffect(() => {
        fetchRoomsFromApi();
    }, [partnerUser, locationId]);

    return (
        <PartnerContentLayout title='Räume' controls={
            <LocationsDropDown
                partnerLocations={partnerLocations}
                locationId={locationId}
                onLocationChange={setLocationId}
            />
        }>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'left',
                alignItems: 'top'
            }}>
                {/* Left Menu (rooms selector) */}
                <List sx={{
                    mr: { xs: 1, sm: 3 },
                    minWidth: { xs: '150px', sm: '200px', md: '250px' },
                }}>
                    <ListItem key={null} disablePadding>
                        <ListItemButton onClick={() => setRoomId(null)}>
                            <ListItemText
                                primary="Alle Räume"
                                sx={{
                                    color: roomId == null ?
                                        theme.palette.customColors.pink.light :
                                        'inherit',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                    {rooms && rooms.map((room) => (
                        <ListItem
                            key={room.id}
                            disablePadding
                            sx={{
                                ml: 2,
                            }}
                        >
                            <ListItemButton onClick={() => setRoomId(room.id)}>
                                <ListItemText
                                    primary={room.name}
                                    primaryTypographyProps={{
                                        sx: {
                                            fontSize: { xs: '12px', sm: '16px' },
                                            color: roomId === room.id
                                                ? theme.palette.customColors.pink.light
                                                : 'inherit',
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Right Content (Rooms Grid or Room Form) */}
                {roomId !== null ? (
                    <RoomForm
                        roomId={roomId}
                        locationId={locationId}
                        roomCreated={(id: number) => {
                            setRoomId(id);
                            fetchRoomsFromApi();
                        }}
                        roomUpdated={fetchRoomsFromApi}
                        roomDeleted={fetchRoomsFromApi}
                    />
                ) : (
                    rooms && <RoomGrid
                        rooms={rooms}
                        selectHandler={setRoomId}
                        roomsChanged={fetchRoomsFromApi}
                        sx={{ height: '100%' }}
                    />
                )}
            </Box>

        </PartnerContentLayout>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            {page}
        </PartnerLayout>
    );
};

export default PartnerPage;