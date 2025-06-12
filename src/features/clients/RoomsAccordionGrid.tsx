import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid2,
    SxProps,
    Theme,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Button
} from '@mui/material';
import { HandCoins, Ruler } from 'lucide-react';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';
import { formatRoomSize } from '@/utils/formatSizes';
import theme from '@/theme';
import {
    calculateBookingPrice,
    calculateSeating,
    FormatPrice,
    getPricingSlotsForDates
} from '@/utils/pricingManager';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { RoomSeatingModel } from '@/models/RoomSeatingModel';

interface VenueSelectorProps {
    sx?: SxProps<Theme>;
}

const seatingTypeOptions = [
    { value: "empty", label: "ohne Mobiliar" },
    { value: "mixed", label: "Gemischt" },
    { value: "standing", label: "Stehplätze" },
    { value: "seated", label: "Sitzplätze" },
];

const RoomsAccordionGrid = ({ sx }: VenueSelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingRoomId, setPendingRoomId] = useState<number | null>(null);
    const [selectedSeating, setSelectedSeating] = useState<string>('');
    const [isExclusive, setIsExclusive] = useState(false);

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
                const seatings = location?.rooms?.find((r) => r.id === roomId)?.roomSeatings;

                if (schedules && eventConfiguration.date && eventConfiguration.endDate) {
                    const overlaps = getPricingSlotsForDates(
                        new Date(eventConfiguration.date),
                        new Date(eventConfiguration.endDate),
                        schedules
                    );

                    const hasExclusiveOverlap = overlaps.some(schedule => schedule.exclusiveType !== "none");
                    const hasSeatings = seatings && seatings.length > 0;

                    if (hasExclusiveOverlap || hasSeatings) {
                        setPendingRoomId(roomId);
                        setDialogOpen(true);
                        setSelectedSeating(seatings?.[0]?.seating || '');
                        setIsExclusive(false);
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
                        seating: seatings?.[0]?.seating || '',
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

    const handleDialogClose = (confirm: boolean) => {
        if (confirm && pendingRoomId !== null && eventConfiguration) {
            const currentRoomExtras = eventConfiguration.roomExtras || [];

            const updatedRoomExtras = [
                ...currentRoomExtras,
                {
                    roomId: pendingRoomId,
                    confId: eventConfiguration.id || 0,
                    persons: eventConfiguration.persons || 0,
                    isExclusive,
                    seating: selectedSeating,
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
        setSelectedSeating('');
        setIsExclusive(false);
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

    const getDialogContent = () => {
        if (!(eventConfiguration?.date && eventConfiguration.endDate && eventConfiguration.persons)) {
            return <Typography>Bitte vervollständigen Sie die Event-Details</Typography>;
        }

        const room = location?.rooms?.find((r) => r.id === pendingRoomId);
        if (!room) return <Typography>Raum nicht gefunden</Typography>;

        const pricings = room.roomPricings;
        const overlaps = pricings
            ? getPricingSlotsForDates(
                new Date(eventConfiguration.date),
                new Date(eventConfiguration.endDate),
                pricings
            )
            : [];

        const hasExclusiveOption = overlaps.some(schedule => schedule.exclusiveType !== "none");
        const hasSeatingOptions = room.roomSeatings && room.roomSeatings.length > 0;

        const bookingStart = new Date(eventConfiguration.date);
        const bookingEnd = new Date(eventConfiguration.endDate);

        const basePrice = calculateBookingPrice({
            bookingStart,
            bookingEnd,
            persons: eventConfiguration.persons,
            basePrice: room.price,
            basePriceType: room.priceType,
            isExclusive: false,
            schedules: room.roomPricings,
        }).total;

        const exclusivePrice = calculateBookingPrice({
            bookingStart,
            bookingEnd,
            persons: eventConfiguration.persons,
            basePrice: room.price,
            basePriceType: room.priceType,
            isExclusive: true,
            schedules: room.roomPricings,
            filters: ['exclusive'],
        }).total;

        return (
            <>
                {room.roomSeatings?.length ? (
                    <FormControl fullWidth sx={{ mt: 2 }} disabled={!hasSeatingOptions}>
                        <InputLabel>Seating</InputLabel>
                        <Select
                            value={selectedSeating}
                            label="Seating"
                            onChange={(e) => setSelectedSeating(e.target.value)}
                        >
                            {room.roomSeatings.map((seating: RoomSeatingModel) => {
                                const seatingPrice = calculateSeating(
                                    basePrice,
                                    bookingStart,
                                    bookingEnd,
                                    eventConfiguration.persons ?? 0,
                                    room.roomSeatings,
                                    seating.seating
                                ).total;
                                return (
                                    <MenuItem key={seating.id} value={seating.seating}>
                                        {(seatingTypeOptions?.find(o => o.value === seating.seating)?.label ?? seating.seating) +
                                            (seatingPrice > 0 ? ` (+ ${FormatPrice.formatPrice(seatingPrice)})` : '')}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                ) : null}
                {hasExclusiveOption &&
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isExclusive}
                                onChange={(e) => setIsExclusive(e.target.checked)}
                            />
                        }
                        label={`Exklusiv buchen (+ ${FormatPrice.formatPrice(exclusivePrice)})`}
                        sx={{ mt: 2 }}
                    />}
            </>
        );
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

    const getSeating = (roomId: number) =>
        eventConfiguration?.roomExtras?.find(r => r.roomId === roomId)?.seating ?? '';

    return (
        <>
            {matchingRooms && matchingRooms.length > 0 ? (
                <Grid2 container spacing={1} sx={{ ...sx }}>
                    {matchingRooms.map((room) => {
                        const isSelected = isRoomSelected(room.id);
                        const isExclusive = isRoomExclusive(room.id) === true;
                        const seating = getSeating(room.id);

                        const calculatedPrice =
                            eventConfiguration?.date &&
                                eventConfiguration?.endDate &&
                                eventConfiguration?.persons
                                ? FormatPrice.formatPrice(
                                    calculateBookingPrice({
                                        bookingStart: new Date(eventConfiguration.date),
                                        bookingEnd: new Date(eventConfiguration.endDate),
                                        persons: eventConfiguration.persons,
                                        basePrice: room.price,
                                        basePriceType: room.priceType,
                                        isExclusive,
                                        schedules: room.roomPricings,
                                        seatings: room.roomSeatings,
                                        seating,
                                    }).total,
                                    room.pricingLabel
                                )
                                : "?";

                        return (
                            <Grid2
                                key={room.id}
                                size={{ xs: 12, md: matchingRooms.length === 1 ? 12 : 6, }}
                                sx={{}}
                            >
                                <AccordionGridItem
                                    id={room.id}
                                    images={room.images.length > 0 ? room.images : []}
                                    isSelected={isSelected}
                                    selectRequested={(id) => toggleRoom(id)}
                                    title={room.name}
                                    subTitle={
                                        `${formatRoomSize(room.size)}, ${calculatedPrice}` +
                                        ` | ${room.minPersons} - ${room.maxPersons} Personen | ` +
                                        [
                                            isExclusive ? 'Exklusiv' : null,
                                            seating ? seatingTypeOptions.find(o => o.value === seating)?.label || seating : null
                                        ].filter(Boolean).join(', ')
                                    }
                                    information={room.description}
                                    additionalNotes={room.services}
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
                </Grid2>
            ) : (
                <Typography variant='h5' sx={{ textAlign: 'center', mt: 6, mb: 2 }}>
                    Keine passenden Räume gefunden
                </Typography>
            )}

            {otherRooms && otherRooms.length > 0 && (
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
                                    ? FormatPrice.formatPrice(
                                        calculateBookingPrice({
                                            bookingStart: new Date(eventConfiguration.date),
                                            bookingEnd: new Date(eventConfiguration.endDate),
                                            persons: eventConfiguration.persons,
                                            basePrice: room.price,
                                            basePriceType: room.priceType,
                                            isExclusive: false,
                                            schedules: room.roomPricings,
                                            seatings: room.roomSeatings,
                                            seating: '',
                                        }).total,
                                        room.pricingLabel
                                    )
                                    : "?";

                            return (
                                <Grid2
                                    key={room.id}
                                    size={{ xs: 12, md: otherRooms.length === 1 ? 12 : 6, }}
                                >
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
                                        additionalNotes={room.services}
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
            )}

            <Dialog
                open={dialogOpen}
                onClose={() => handleDialogClose(false)}
                aria-labelledby="room-options-dialog-title"
                aria-describedby="room-options-dialog-description"
            >
                <DialogTitle id="room-options-dialog-title" sx={{ textAlign: 'center', padding: 3 }}>
                    Raum-Optionen
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="room-options-dialog-description" sx={{ textAlign: 'center' }}>
                        {getDialogContent()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' onClick={() => handleDialogClose(false)} color="primary">
                        Abbrechen
                    </Button>
                    <Button variant='contained' onClick={() => handleDialogClose(true)} color="primary" autoFocus>
                        Bestätigen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RoomsAccordionGrid;