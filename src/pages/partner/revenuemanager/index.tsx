import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, CircularProgress, Typography, useMediaQuery } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';
import { RoomModel } from '@/models/RoomModel';
import { fetchRoomsByCompany } from '@/services/roomService';
import PageHeadline from '@/features/partners/PageHeadline';
import RoomsDropDown from '@/features/partners/RoomsDropDown';
import RoomPricings from '@/features/partners/RoomPricings';
import theme from '@/theme';
import { WaitIcon } from '@/components/WaitIcon';
import RoomSeatings from '@/features/partners/RoomSeatings';

const PartnerPage: NextPageWithLayout = () => {
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const { partnerUser, partnerLocations } = useStore();
    const [roomId, setRoomId] = useState<number | null>(null);
    const [rooms, setRooms] = useState<RoomModel[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const subTtile =
        'Mit dem Revenue Manager kannst du dynamisches Pricing ' +
        'für deine Angebote einrichten um deine Events ' +
        'genau so zu bepreisen wie du willst.';

    const fetchRoomsFromApi = async (selectRoom: number | null | undefined = undefined) => {
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }

        const rooms = await fetchRoomsByCompany(
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
    }, [partnerUser]);

    if (!isLoading && (!partnerLocations || partnerLocations.length == 0)) {
        return (
            <PartnerContentLayout title='Revenue Manager'>
                <Box sx={{
                    width: '100%',
                    mt: 10,
                }}>
                    <Typography variant="h5" textAlign="center">
                        Erstelle bitte zunächst eine Location.
                    </Typography>
                </Box>
            </PartnerContentLayout>
        );
    }

    return (
        <PartnerContentLayout
            title='Revenue Manager'
            description={subTtile}
            margins={0}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'left',
                alignItems: 'top'
            }}>
                {/* Pricing Slots (Day and Time) */}


                <Box sx={{ ml: 0, mr: 0, }}>
                    {rooms &&
                        <Box>
                            <RoomsDropDown
                                rooms={rooms}
                                roomId={roomId}
                                onRoomChange={(id) => setRoomId(id)}
                                sx={{ ml: 2, mb: 4, }}
                            />
                            <PageHeadline title='Tag und Zeit' />
                            <Box sx={{ ml: 4, mr: 4, mb: 4, }}>
                                <Typography
                                    variant={isMobile ? 'body2' : 'body1'}
                                    sx={{ mt: 2, mb: 1 }}
                                >
                                    Erstelle Zeitslots mit individuellen Preisberechnungen
                                </Typography>
                                <RoomPricings roomId={roomId} />
                            </Box>

                            <PageHeadline title='Seating' />
                            <Box sx={{ ml: 4, mr: 4, }}>
                                <Typography
                                    variant={isMobile ? 'body2' : 'body1'}
                                    sx={{ mt: 2, mb: 1 }}
                                >
                                    Erstelle Seatings mit individuellen Preisberechnungen
                                </Typography>
                                <RoomSeatings roomId={roomId} />
                            </Box>
                        </Box>
                    }

                    {isLoading && <WaitIcon />}
                </Box>
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