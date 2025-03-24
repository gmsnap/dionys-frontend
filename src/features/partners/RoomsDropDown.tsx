import React from 'react';
import { Box, Select, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import { RoomModel } from '@/models/RoomModel';

interface Props {
    rooms: RoomModel[] | null;
    roomId: number | null;
    onRoomChange?: (locationId: number) => void;
}

const RoomsDropDown: React.FC<Props> = ({
    rooms,
    roomId,
    onRoomChange
}) => {
    const handleChange = (event: SelectChangeEvent<number>) => {
        onRoomChange?.(event.target.value as number);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'start', sm: 'center' },
            }}
        >
            {rooms && rooms.length > 0 && (
                <Select
                    value={roomId || ''}
                    onChange={handleChange}
                    displayEmpty
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <MenuItem value="">
                        <em>Raum auswählen</em>
                    </MenuItem>
                    {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                            {room.name}
                        </MenuItem>
                    ))}
                </Select>
            )}
        </Box>
    );
};

export default RoomsDropDown;