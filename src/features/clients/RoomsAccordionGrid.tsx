import React, { useEffect, useState } from 'react';
import { Button, Grid2, SxProps, Theme } from '@mui/material';
import { HandCoins, Package, Ruler } from 'lucide-react';
import { RoomModel } from '@/models/RoomModel';
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

    const setRoomId = (roomId: number) => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                roomId,
            });
        }
    };

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    return (
        <Grid2 container spacing={5} sx={{ ...sx }}>
            {location?.rooms &&
                location.rooms.map((room) => (
                    <Grid2 key={room.id} size={{ xs: 12 }}>
                        <AccordionGridItem
                            id={room.id}
                            image={room.images.length > 0 ? room.images[0] as string : ""}
                            isSelected={eventConfiguration?.roomId === room.id}
                            selectRequested={(id) => setRoomId(id)}
                            title={room.name}
                            subTitle={`${formatRoomSize(room.size)}, ${formatPrice(room.price)}`}
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