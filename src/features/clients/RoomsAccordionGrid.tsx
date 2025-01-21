import React, { useEffect, useState } from 'react';
import { Button, Grid2, SxProps, Theme } from '@mui/material';
import { RoomModel } from '@/models/RoomModel';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';

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
                            information={room.description}
                        />
                    </Grid2>
                ))}
        </Grid2 >
    );
};

export default RoomsAccordionGrid;