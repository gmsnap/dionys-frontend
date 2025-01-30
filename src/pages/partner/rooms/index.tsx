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

    const fetchRoomsFromApi = async (selectRoom: number | null | undefined = undefined) => {
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
            setRoomId(null);
            setError("Error fetching rooms");
            return;
        }

        // Set rooms to state
        setRooms(rooms);
        setError(null);
        if (selectRoom !== undefined) {
            setRoomId(selectRoom);
        }
    };

    useEffect(() => {
        setRoomId(null);
        fetchRoomsFromApi();
    }, [partnerUser, locationId]);

    if (!partnerLocations || partnerLocations.length == 0) {
        return (
            <PartnerContentLayout title='Räume'>
                <Box sx={{
                    width: '100%',
                    mt: 10,
                }}>
                    <Typography variant="h5" textAlign="center">
                        Erstellen Sie bitte zunächst eine Location.
                    </Typography>
                </Box>
            </PartnerContentLayout>
        );
    }

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
                {rooms && rooms?.length > 0 &&
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                    }}>
                        <ListItem key={null} disablePadding>
                            <ListItemButton onClick={() => setRoomId(null)}
                                sx={{
                                    pt: { xs: 0, sm: 'inherit' },
                                    pb: { xs: 0, sm: 'inherit' },
                                }}
                            >
                                <ListItemText
                                    primary="Alle Räume"
                                    primaryTypographyProps={{
                                        sx: {
                                            fontSize: { xs: '12px', sm: 'unset' },
                                        }
                                    }}
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
                                    ml: { xs: 0, sm: 2 },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => setRoomId(room.id)}
                                    sx={{
                                        pt: { xs: 0, sm: 'unset' },
                                        pb: { xs: 0, sm: 'unset' },
                                    }}
                                >
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
                    </List>}

                {/* Right Content (Rooms Grid or Room Form) */}
                {roomId !== null &&
                    partnerUser !== null &&
                    partnerUser.companyId !== null ? (
                    <RoomForm
                        roomId={roomId}
                        locationId={locationId}
                        companyId={partnerUser.companyId}
                        roomCreated={(id: number) => {
                            fetchRoomsFromApi(id);
                        }}
                        roomUpdated={fetchRoomsFromApi}
                        roomDeleted={() => fetchRoomsFromApi(null)}
                    />
                ) : (
                    rooms && <RoomGrid
                        rooms={rooms}
                        addButton={true}
                        selectHandler={setRoomId}
                        roomsChanged={fetchRoomsFromApi}
                        sx={{
                            width: '100%',
                            height: '100%',
                            justifyContent: rooms.length == 0 ? 'center' : 'inherit'
                        }}
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