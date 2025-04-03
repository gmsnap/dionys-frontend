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
            const currentRoomIds = eventConfiguration.roomIds || [];
            const currentExclusiveIds = eventConfiguration.roomExclusiveIds || [];

            // If room is already selected, remove it
            if (currentRoomIds.includes(roomId)) {
                const updatedRoomIds = currentRoomIds.filter(id => id !== roomId);
                const updatedExclusiveIds = currentExclusiveIds.filter(id => id !== roomId);
                const roomIdSet = new Set(updatedRoomIds);
                const rooms = location?.rooms?.filter(room => roomIdSet.has(room.id));

                setEventConfiguration({
                    ...eventConfiguration,
                    roomIds: updatedRoomIds,
                    rooms: rooms || null,
                    roomExclusiveIds: updatedExclusiveIds
                });
            } else {
                const schedules = location?.rooms?.find((r) => r.id === roomId)?.roomPricings;

                // Check for exclusive overlaps if schedules and dates exist
                if (schedules && eventConfiguration.date && eventConfiguration.endDate) {
                    const overlaps = getPricingSlotsForDates(
                        new Date(eventConfiguration.date),
                        new Date(eventConfiguration.endDate),
                        schedules
                    );

                    // Check if any overlapping schedule is exclusive
                    const hasExclusiveOverlap = overlaps.some(schedule => schedule.exclusivePriceType !== "none");

                    if (hasExclusiveOverlap) {
                        // Show dialog only if there's an exclusive overlap
                        setPendingRoomId(roomId);
                        setDialogOpen(true);
                        return; // Exit early, dialog will handle the rest
                    }
                }

                // No exclusive overlaps found or no schedules/dates, proceed without dialog
                const updatedRoomIds = [...currentRoomIds, roomId];
                const roomIdSet = new Set(updatedRoomIds);
                const rooms = location?.rooms?.filter(room => roomIdSet.has(room.id));

                setEventConfiguration({
                    ...eventConfiguration,
                    roomIds: updatedRoomIds,
                    rooms: rooms || null,
                    roomExclusiveIds: currentExclusiveIds // No change to exclusive IDs
                });
            }
        }
    };

    const handleDialogClose = (makeExclusive: boolean) => {
        if (pendingRoomId !== null && eventConfiguration) {
            const currentRoomIds = eventConfiguration.roomIds || [];
            const currentExclusiveIds = eventConfiguration.roomExclusiveIds || [];

            const updatedRoomIds = [...currentRoomIds, pendingRoomId];
            const roomIdSet = new Set(updatedRoomIds);
            const rooms = location?.rooms?.filter(room => roomIdSet.has(room.id));

            const updatedExclusiveIds = makeExclusive
                ? [...currentExclusiveIds, pendingRoomId]
                : [...currentExclusiveIds];

            setEventConfiguration({
                ...eventConfiguration,
                roomIds: updatedRoomIds,
                rooms: rooms || null,
                roomExclusiveIds: updatedExclusiveIds
            });
        }

        setDialogOpen(false);
        setPendingRoomId(null);
    };

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    const getExclusiveNote = () => {
        const withoutPrice = <Typography>Möchten Sie den Raum exklusiv buchen?</Typography>;

        if (!(eventConfiguration?.date &&
            eventConfiguration.endDate &&
            eventConfiguration.persons)) {
            return withoutPrice;
        }
        const room = location?.rooms?.find((r) => r.id === pendingRoomId);

        console.log("r ", room)

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
    }

    const getOtherRooms = () => {
        return location?.rooms?.filter(
            r => (
                eventConfiguration && (eventConfiguration.persons == null ||
                    !(r.minPersons <= eventConfiguration.persons &&
                        r.maxPersons >= eventConfiguration.persons))
            )
        );
    };

    const matchingRooms = location?.rooms?.filter(
        r => (
            eventConfiguration && (eventConfiguration?.persons != null &&
                r.minPersons <= eventConfiguration.persons &&
                r.maxPersons >= eventConfiguration.persons)
        )
    );

    const otherRooms = getOtherRooms();

    useEffect(() => {
        if (eventConfiguration && location?.rooms) {
            const currentRoomIds = eventConfiguration.roomIds || [];
            const currentExclusiveIds = eventConfiguration.roomExclusiveIds || [];
            const otherRoomIds = new Set(getOtherRooms()?.map(room => room.id) || []);

            // Check if any currentRoomIds are in otherRooms
            const invalidRoomIds = currentRoomIds.filter(id => otherRoomIds.has(id));

            if (invalidRoomIds.length > 0) {
                // Remove invalid rooms from both arrays
                const updatedRoomIds = currentRoomIds.filter(id => !otherRoomIds.has(id));
                const updatedExclusiveIds = currentExclusiveIds.filter(id => !otherRoomIds.has(id));
                const roomIdSet = new Set(updatedRoomIds);
                const rooms = location.rooms.filter(room => roomIdSet.has(room.id));

                setEventConfiguration({
                    ...eventConfiguration,
                    roomIds: updatedRoomIds,
                    rooms: rooms || null,
                    roomExclusiveIds: updatedExclusiveIds
                });
            }
        }
    }, [eventConfiguration, location?.rooms]);

    return (
        <>
            {matchingRooms && matchingRooms.length > 0 ?
                <Grid2 container spacing={1} sx={{ ...sx }}>
                    {matchingRooms.map((room) => {
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
                                        eventConfiguration.roomExclusiveIds?.includes(room.id) === true,
                                        room.roomPricings
                                    )
                                )
                                : "?";

                        const isSelected = eventConfiguration?.roomIds?.includes(room.id);
                        const isExclusive = isSelected &&
                            eventConfiguration?.roomExclusiveIds?.includes(room.id);

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

            {/* Further rooms (that don't match with current selection) */}
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
                                            eventConfiguration.roomExclusiveIds?.includes(room.id) === true,
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
                <DialogTitle
                    id="exclusive-room-dialog-title"
                    sx={{
                        textAlign: 'center',
                        padding: 3,
                    }}
                >
                    Exklusiv-Option verfügbar
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        id="exclusive-room-dialog-description"
                        sx={{ textAlign: 'center', }}
                    >
                        {getExclusiveNote()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={() => handleDialogClose(false)}
                        color="primary"
                    >
                        Nein
                    </Button>
                    <Button
                        variant='contained'
                        onClick={() => handleDialogClose(true)}
                        color="primary" autoFocus
                    >
                        Ja
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RoomsAccordionGrid;