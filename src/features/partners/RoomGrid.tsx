import React, { } from 'react';
import { Box, SxProps, Theme, Grid2, Button } from '@mui/material';
import GridItem from '@/components/GridItem';
import { Pencil, User, X } from 'lucide-react';
import GridAddItem from '@/components/GridAddItem';
import { RoomModel } from '@/models/RoomModel';
import { handleDeleteRoom } from '@/services/roomService';
import theme from '@/theme';
import { useAuthContext } from '@/auth/AuthContext';
import { FormatPrice } from '@/utils/pricingManager';

interface RoomGridProps {
    sx?: SxProps<Theme>;
    rooms: RoomModel[];
    addButton: boolean;
    selectHandler?: (id: number) => void;
    roomsChanged?: () => void;
}

const RoomGrid = ({ sx, rooms, addButton = true, selectHandler, roomsChanged }: RoomGridProps) => {
    const { authUser } = useAuthContext();

    return (
        <Grid2 container spacing={5} alignItems="stretch" sx={{ ...sx }}>
            {rooms.map((room) => (
                <Grid2 key={room.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                    <GridItem
                        id={room.id}
                        image={room.images[0]}
                        title={room.name}
                        priceTag={FormatPrice.formatPriceWithType(
                            {
                                price: room.price,
                                priceType: room.priceType,
                            }
                        )}
                        listItems={[{
                            icon: <User color={theme.palette.customColors.blue.main} />,
                            label: `${room.minPersons}-${room.maxPersons}`
                        }]}
                        buttons={[
                            <Button
                                key={`${room.id}-1`}
                                variant="edit"
                                onClick={() => { selectHandler?.(room.id); }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: {
                                            xs: 'inline',
                                            sm: 'none',
                                            lg: 'inline',
                                        },
                                    }}
                                >
                                    Bearbeiten
                                </Box>
                                <Box component="span" sx={{ ml: 1, }}>
                                    <Pencil className="icon" width={12} height={12} />
                                </Box>
                            </Button>,
                            <Button
                                key={`${room.id}-2`}
                                variant="delete"
                                disabled={!authUser?.idToken}
                                onClick={
                                    () => authUser?.idToken
                                        ? handleDeleteRoom(
                                            authUser.idToken,
                                            room.id,
                                            () => roomsChanged?.()
                                        )
                                        : {}
                                }
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: {
                                            xs: 'inline',
                                            sm: 'none',
                                            lg: 'inline',
                                        },
                                    }}
                                >
                                    Löschen
                                </Box>
                                <Box component="span" sx={{ ml: 1 }}>
                                    <X className="icon" width={16} height={16} />
                                </Box>
                            </Button>,
                        ]}
                        onImageClick={() => { selectHandler?.(room.id); }}
                    />
                </Grid2>
            ))}
            {addButton &&
                <Grid2 key={-1} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} display="flex">
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <GridAddItem
                            id={-1}
                            handler={() => { selectHandler?.(0); }}
                            sx={{ flex: 1, height: '100%' }}
                        />
                    </Box>
                </Grid2>}
        </Grid2>
    );
};

export default RoomGrid;