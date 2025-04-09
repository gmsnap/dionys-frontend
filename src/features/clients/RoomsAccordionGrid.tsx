import React, { useEffect, useState } from 'react';
import { Box, Grid2, SxProps, Theme, Typography } from '@mui/material';
import { HandCoins, Ruler } from 'lucide-react';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';
import { formatPrice } from '@/utils/formatPrice';
import { formatRoomSize } from '@/utils/formatSizes';
import theme from '@/theme';
import { calculateBookingPrice, getPricingSlotsForDates } from '@/utils/pricingManager';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface VenueSelectorProps {
    sx?: SxProps<Theme>;
}

const RoomsAccordionGrid = ({ sx }: VenueSelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingRoomId, setPendingRoomId] = useState<number | null>(null);

    const toggleRoom = (roomId: number) => {
        if (eventConfiguration) {
            const currentRoomExtras = eventConfiguration.roomExtras || [];
            const isSelected = currentRoomExtras.some(extra => extra.roomId === roomId);

            if (isSelected) {
                const updatedRoomExtras = currentRoomExtras.filter(r => r.roomId !== roomId);
                const updatedRoomIds = updatedRoomExtras.map(r => r.roomId);
                const rooms = location?.rooms?.filter(room => updatedRoomIds.includes(room.id)) || null;

                setEventConfiguration({
                    ...eventConfiguration,
                    roomExtras: updatedRoomExtras,
                    rooms,
                });
            } else {
                const schedules = location?.rooms?.find((r) => r.id === roomId)?.roomPricings;

                if (schedules && eventConfiguration.date && eventConfiguration.endDate) {
                    const overlaps = getPricingSlotsForDates(
                        new Date(eventConfiguration.date),
                        new Date(eventConfiguration.endDate),
                        schedules
                    );

                    const hasExclusiveOverlap = overlaps.some(schedule => schedule.exclusivePriceType !== "none");
                    if (hasExclusiveOverlap) {
                        setPendingRoomId(roomId);
                        setDialogOpen(true);
                        return;
                    }
                }

                const updatedRoomExtras = [
                    ...currentRoomExtras,
                    {
                        roomId,
                        confId: eventConfiguration.id || 0,
                        persons: eventConfiguration.persons || 0,
                        isExclusive: false,
                        seating: undefined,
                    }
                ];
                const updatedRoomIds = updatedRoomExtras.map(r => r.roomId);
                const rooms = location?.rooms?.filter(room => updatedRoomIds.includes(room.id)) || null;

                setEventConfiguration({
                    ...eventConfiguration,
                    roomExtras: updatedRoomExtras,
                    rooms,
                });
            }
        }
    };

    const handleDialogClose = (makeExclusive: boolean) => {
        if (pendingRoomId !== null && eventConfiguration) {
            const currentRoomExtras = eventConfiguration.roomExtras || [];

            const updatedRoomExtras = [
                ...currentRoomExtras,
                {
                    roomId: pendingRoomId,
                    confId: eventConfiguration.id || 0,
                    persons: eventConfiguration.persons || 0,
                    isExclusive: makeExclusive,
                    seating: undefined,
                }
            ];
            const updatedRoomIds = updatedRoomExtras.map(r => r.roomId);
            const rooms = location?.rooms?.filter(room => updatedRoomIds.includes(room.id)) || null;

            setEventConfiguration({
                ...eventConfiguration,
                roomExtras: updatedRoomExtras,
                rooms,
            });
        }

        setDialogOpen(false);
        setPendingRoomId(null);
    };

    const getOtherRooms = () => {
        return location?.rooms?.filter(
            r => (
                eventConfiguration && (eventConfiguration.persons == null ||
                    !(r.minPersons <= eventConfiguration.persons &&
                        r.maxPersons >= eventConfiguration.persons))
            )
        );
    };

    useEffect(() => {
        if (eventConfiguration && location?.rooms) {
            const currentRoomExtras = eventConfiguration.roomExtras || [];
            const otherRoomIds = new Set(getOtherRooms()?.map(room => room.id) || []);

            const updatedRoomExtras = currentRoomExtras.filter(r => !otherRoomIds.has(r.roomId));
            const updatedRoomIds = updatedRoomExtras.map(r => r.roomId);
            const rooms = location.rooms.filter(room => updatedRoomIds.includes(room.id));

            if (updatedRoomExtras.length !== currentRoomExtras.length) {
                setEventConfiguration({
                    ...eventConfiguration,
                    roomExtras: updatedRoomExtras,
                    rooms,
                });
            }
        }
    }, [eventConfiguration, location?.rooms]);

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    const getExclusiveNote = () => {
        const withoutPrice = <Typography>Möchten Sie den Raum exklusiv buchen?</Typography>;
        if (!(eventConfiguration?.date && eventConfiguration.endDate && eventConfiguration.persons)) {
            return withoutPrice;
        }

        const room = location?.rooms?.find((r) => r.id === pendingRoomId);
        if (!room) return withoutPrice;

        const exclusivePrice = calculateBookingPrice(
            new Date(eventConfiguration.date),
            new Date(eventConfiguration.endDate),
            eventConfiguration.persons,
            room.price,
            room.priceType,
            true,
            room.roomPricings,
            ['exclusive'],
        );

        return <>
            {withoutPrice}
            <Typography>Aufpreis für Exklusivbuchung: {formatPrice(exclusivePrice)}</Typography>
        </>;
    };

    const matchingRooms = location?.rooms?.filter(
        r => (
            eventConfiguration?.persons != null &&
            r.minPersons <= eventConfiguration.persons &&
            r.maxPersons >= eventConfiguration.persons
        )
    );

    const otherRooms = getOtherRooms();

    const isRoomSelected = (roomId: number) =>
        eventConfiguration?.roomExtras?.some(r => r.roomId === roomId);

    const isRoomExclusive = (roomId: number) =>
        eventConfiguration?.roomExtras?.some(r => r.roomId === roomId && r.isExclusive);

    return (
        <>
            {matchingRooms && matchingRooms.length > 0 ?
                <Grid2 container spacing={1} sx={{ ...sx }}>
                    {matchingRooms.map((room) => {
                        const isSelected = isRoomSelected(room.id);
                        const isExclusive = isRoomExclusive(room.id);
                        const calculatedPrice =
                            eventConfiguration?.date &&
                                eventConfiguration?.endDate &&
                                eventConfiguration?.persons
                                ? formatPrice(
                                    calculateBookingPrice(
                                        new Date(eventConfiguration.date),
                                        new Date(eventConfiguration.endDate),
                                        eventConfiguration.persons,
                                        room.price,
                                        room.priceType,
                                        isExclusive ?? false,
                                        room.roomPricings
                                    )
                                )
                                : "?";

                        return (
                            <Grid2 key={room.id} size={{ xs: 12 }}>
                                <AccordionGridItem
                                    id={room.id}
                                    images={room.images.length > 0 ? room.images : []}
                                    isSelected={isSelected}
                                    selectRequested={(id) => toggleRoom(id)}
                                    title={room.name}
                                    subTitle={
                                        `${formatRoomSize(room.size)}, ${calculatedPrice}` +
                                        ` | ${room.minPersons} - ${room.maxPersons} Personen` +
                                        ` | ${isExclusive ? 'Exklusiv' : ''}`
                                    }
                                    information={room.description}
                                    infoItems={[
                                        {
                                            icon: <Ruler color={iconColor} />,
                                            label: formatRoomSize(room.size),
                                        },
                                        {
                                            icon: <HandCoins color={iconColor} />,
                                            label: calculatedPrice,
                                        },
                                    ]}
                                />
                            </Grid2>
                        );
                    })}
                </Grid2> :
                <Typography variant='h5' sx={{ textAlign: 'center', mt: 6, mb: 2 }}>
                    Keine passenden Räume gefunden
                </Typography>
            }

            {otherRooms && otherRooms.length > 0 &&
                <>
                    <Box
                        sx={{
                            borderTop: `1px solid ${theme.palette.customColors.blue.halfdark}`,
                            width: '100%',
                            mt: 6,
                        }}
                    />
                    <Typography variant='h5' sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                        Weitere Räume
                    </Typography>
                    <Grid2 container spacing={1} sx={{ ...sx }}>
                        {otherRooms.map((room) => {
                            const calculatedPrice =
                                eventConfiguration?.date &&
                                    eventConfiguration?.endDate &&
                                    eventConfiguration?.persons
                                    ? formatPrice(
                                        calculateBookingPrice(
                                            new Date(eventConfiguration.date),
                                            new Date(eventConfiguration.endDate),
                                            eventConfiguration.persons,
                                            room.price,
                                            room.priceType,
                                            false,
                                            room.roomPricings
                                        )
                                    )
                                    : "?";

                            return (
                                <Grid2 key={room.id} size={{ xs: 12 }}>
                                    <AccordionGridItem
                                        id={room.id}
                                        images={room.images.length > 0 ? room.images : []}
                                        isSelected={false}
                                        selectRequested={(id) => toggleRoom(id)}
                                        title={room.name}
                                        subTitle={
                                            `${formatRoomSize(room.size)}, ${calculatedPrice}` +
                                            ` | ${room.minPersons} - ${room.maxPersons} Personen`
                                        }
                                        information={room.description}
                                        infoItems={[
                                            {
                                                icon: <Ruler color={iconColor} />,
                                                label: formatRoomSize(room.size),
                                            },
                                            {
                                                icon: <HandCoins color={iconColor} />,
                                                label: calculatedPrice,
                                            },
                                        ]}
                                        isActive={false}
                                    />
                                </Grid2>
                            );
                        })}
                    </Grid2>
                </>
            }

            <Dialog
                open={dialogOpen}
                onClose={() => handleDialogClose(false)}
                aria-labelledby="exclusive-room-dialog-title"
                aria-describedby="exclusive-room-dialog-description"
            >
                <DialogTitle id="exclusive-room-dialog-title" sx={{ textAlign: 'center', padding: 3 }}>
                    Exklusiv-Option verfügbar
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="exclusive-room-dialog-description" sx={{ textAlign: 'center' }}>
                        {getExclusiveNote()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' onClick={() => handleDialogClose(false)} color="primary">
                        Nein
                    </Button>
                    <Button variant='contained' onClick={() => handleDialogClose(true)} color="primary" autoFocus>
                        Ja
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RoomsAccordionGrid;