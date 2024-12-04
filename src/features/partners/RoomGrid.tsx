import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Grid2, CircularProgress, Button } from '@mui/material';
import GridItem from '@/components/GridItem';
import { formatPrice } from '@/utils/formatPrice';
import { Layers2, Pencil, User, X } from 'lucide-react';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import GridAddItem from '@/components/GridAddItem';
import Link from 'next/link';
import theme from '@/theme';

interface RoomGridProps {
    sx?: SxProps<Theme>;
}

const RoomGrid = ({ sx }: RoomGridProps) => {
    const [rooms, setRooms] = useState<RoomModel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteRoom = (lroomId: number): void => {

    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/1/rooms`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setRooms(result);
                setIsLoading(false);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" sx={sx}>
                <div>Error: {error}</div>
            </Box>
        );
    }

    return (
        <Grid2 container spacing={5} alignItems="stretch" sx={{ ...sx }}>
            {rooms.map((room) => (
                <Grid2 key={room.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} display="flex">
                    <GridItem
                        id={room.id}
                        image={room.images[0]}
                        title={room.name}
                        priceTag={`Ab ${formatPrice(1500)} / Tag`}
                        listItems={[{ icon: <User />, label: '10-50' }]}
                        buttons={[
                            <Button
                                variant="outlined"
                                color="primary"
                                component={Link}
                                href={`/partner/rooms/edit/${room.id}`}
                                sx={{
                                    flex: 1,
                                    '&:hover': {
                                        backgroundColor: theme.palette.customColors.textBackround.halfdark,
                                    },
                                    lineHeight: 0,
                                }}
                            >
                                Edit
                                <Box
                                    component="span" sx={{ ml: 1, }}
                                >
                                    <Pencil color="#000000" width={12} height={12} />
                                </Box>
                            </Button>,
                            <Button
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
                                onClick={() => handleDeleteRoom(room.id)}
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
                        handler={() => { console.log('add room') }}
                        sx={{ flex: 1, height: '100%' }}
                    />
                </Box>
            </Grid2>
        </Grid2>
    );
};

export default RoomGrid;