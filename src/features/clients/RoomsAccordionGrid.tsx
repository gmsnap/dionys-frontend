import React, { } from 'react';
import { Grid2, SxProps, Theme } from '@mui/material';
import { HandCoins, Ruler } from 'lucide-react';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';
import { formatPrice, formatPriceWithType } from '@/utils/formatPrice';
import { formatRoomSize } from '@/utils/formatSizes';
import theme from '@/theme';

interface VenueSelectorProps {
    sx?: SxProps<Theme>;
}

const RoomsAccordionGrid = ({ sx }: VenueSelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();

    const toggleRoom = (roomId: number) => {
        if (eventConfiguration) {
            const currentRoomIds = eventConfiguration.roomIds || [];
            const updatedRoomIds = currentRoomIds.includes(roomId)
                ? currentRoomIds.filter(id => id !== roomId) // Remove if already selected
                : [...currentRoomIds, roomId]; // Add if not selected
            const roomIdSet = new Set(updatedRoomIds);
            const rooms = location?.rooms?.filter(room => roomIdSet.has(room.id));

            setEventConfiguration({
                ...eventConfiguration,
                roomIds: updatedRoomIds,
                rooms: rooms || null,
            });
        }
    };

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    return (
        <Grid2 container spacing={1} sx={{ ...sx }}>
            {location?.rooms &&
                location.rooms.map((room) => (
                    <Grid2 key={room.id} size={{ xs: 12 }}>
                        <AccordionGridItem
                            id={room.id}
                            images={room.images.length > 0 ? room.images : []}
                            isSelected={eventConfiguration?.roomIds?.includes(room.id)}
                            selectRequested={(id) => toggleRoom(id)}
                            title={room.name}
                            subTitle={
                                `${formatRoomSize(room.size)}, ${formatPrice(room.price)}` +
                                `|${room.minPersons} - ${room.maxPersons} Personen`
                            }
                            information={room.description}
                            infoItems={[
                                {
                                    icon: <Ruler color={iconColor} />,
                                    label: formatRoomSize(room.size)
                                },
                                {
                                    icon: <HandCoins color={iconColor} />,
                                    label: formatPriceWithType(room.price, room.priceType)
                                },
                            ]}
                        />
                    </Grid2>
                ))}
        </Grid2 >
    );
};

export default RoomsAccordionGrid;