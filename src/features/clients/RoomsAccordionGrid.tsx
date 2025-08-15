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
    getApplicableSlots,
    PricingLabels,
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
    { value: "empty", label: FormatPrice.translate("seating_empty") },
    { value: "mixed", label: FormatPrice.translate("seating_mixed") },
    { value: "standing", label: FormatPrice.translate("seating_standing") },
    { value: "seated", label: FormatPrice.translate("seating_seated") },
];

const RoomsAccordionGrid = ({ sx }: VenueSelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingRoomId, setPendingRoomId] = useState<number | null>(null);
    const [selectedSeating, setSelectedSeating] = useState<string>('');
    const [isExclusiveSelected, setIsExclusiveSelected] = useState(false);
    const [lockExclusive, setLockExclusive] = useState(false);

    const getDefaultSeating = (seatings: RoomSeatingModel[] | undefined) => {
        if (!seatings) return '';

        return seatings
            .slice()
            .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))?.[0]?.seating || '';
    }

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
                    const applicableSlots = getApplicableSlots(
                        new Date(eventConfiguration.date),
                        new Date(eventConfiguration.endDate),
                        schedules
                    );

                    const exclusiveSlots = applicableSlots
                        .filter(slot => slot.schedule.exclusiveType !== "none");

                    const hasExclusiveSlots = exclusiveSlots.length > 0;

                    if (hasExclusiveSlots) {
                        const hasOptional = exclusiveSlots
                            .some(slot => slot.schedule.exclusiveType === "optional");
                        setLockExclusive(!hasOptional);

                        if (!hasOptional) {
                            const allMandatory = exclusiveSlots.every(slot => slot.schedule.exclusiveType === "mandatory");
                            setIsExclusiveSelected(allMandatory);
                        }
                    } else {
                        setIsExclusiveSelected(false);
                    }

                    const hasSeatings = seatings && seatings.length > 0;

                    if (hasExclusiveSlots || hasSeatings) {
                        setPendingRoomId(roomId);
                        setDialogOpen(true);
                        setSelectedSeating(getDefaultSeating(seatings));
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
                        seating: getDefaultSeating(seatings),
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
                    isExclusive: isExclusiveSelected,
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
        setIsExclusiveSelected(false);
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
            ? getApplicableSlots(
                new Date(eventConfiguration.date),
                new Date(eventConfiguration.endDate),
                pricings
            )
            : [];

        const hasExclusiveOption = overlaps
            .some(overlap => overlap.schedule.exclusiveType !== "none");
        const hasSeatingOptions = room.roomSeatings && room.roomSeatings.length > 0;

        const bookingStart = new Date(eventConfiguration.date);
        const bookingEnd = new Date(eventConfiguration.endDate);

        const basePrice = calculateBookingPrice({
            bookingStart,
            bookingEnd,
            persons: eventConfiguration.persons,
            basePrice: room.price,
            basePriceType: room.priceType,
            basePriceLabel: room.pricingLabel,
            excludeExclusive: true,
            schedules: room.roomPricings,
            context: "booker",
            short: true,
            isSingleOperation: true,
        }).total;

        const exclusivePrice = calculateBookingPrice({
            bookingStart,
            bookingEnd,
            persons: eventConfiguration.persons,
            basePrice: room.price,
            basePriceType: room.priceType,
            excludeRoomPrice: true,
            schedules: room.roomPricings,
            context: "booker",
            short: true,
            isSingleOperation: true,
        });

        let exclusiveText = "";
        if (exclusivePrice.total > 0) {
            exclusiveText = `+ ${FormatPrice.formatPriceValue(exclusivePrice.total)}`;
        } else if (exclusivePrice.items) {
            let sum = 0;
            exclusivePrice.items
                .filter(i => i.itemType === "exclusivity" && i.ignore === false)
                .forEach(i => { sum += i.price });
            exclusiveText = sum > 0
                ? `+ ${FormatPrice.formatPriceValue(sum)}`
                : FormatPrice.translate("free");
        } else {
            exclusiveText = FormatPrice.translate("free");
        }

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
                            {room.roomSeatings
                                ?.slice() // avoid mutating the original array
                                .sort((a, b) => (a.price ?? 0) - (b.price ?? 0)) // sort by price ASC
                                .map((seating: RoomSeatingModel) => {
                                    const seatingPrice = calculateSeating({
                                        totalPrice: basePrice,
                                        bookingStart,
                                        bookingEnd,
                                        persons: eventConfiguration.persons ?? 0,
                                        seatings: room.roomSeatings,
                                        seating: seating.seating,
                                    }).total;

                                    const formattedSeatingPrice = seatingPrice > 0
                                        ? ` (+ ${FormatPrice.formatPriceValue(seatingPrice)})`
                                        : seatingPrice < 0
                                            ? ` (${FormatPrice.formatPriceValue(seatingPrice)})`
                                            : '';

                                    return (
                                        <MenuItem key={seating.id} value={seating.seating}>
                                            {(seatingTypeOptions?.find(o => o.value === seating.seating)?.label ?? seating.seating) +
                                                formattedSeatingPrice}
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
                                checked={isExclusiveSelected === true}
                                disabled={lockExclusive}
                                onChange={(e) => setIsExclusiveSelected(e.target.checked)}
                            />
                        }
                        label={`Exklusiv buchen (${exclusiveText})`}
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

                        const calculatedPriceResult =
                            eventConfiguration?.date &&
                                eventConfiguration?.endDate &&
                                eventConfiguration?.persons
                                ? calculateBookingPrice({
                                    bookingStart: new Date(eventConfiguration.date),
                                    bookingEnd: new Date(eventConfiguration.endDate),
                                    persons: eventConfiguration.persons,
                                    basePrice: room.price,
                                    basePriceType: room.priceType,
                                    basePriceLabel: room.pricingLabel,
                                    excludeExclusive: !isExclusive,
                                    schedules: room.roomPricings,
                                    seatings: room.roomSeatings,
                                    seating,
                                    context: "booker",
                                    short: true,
                                    isSingleOperation: true,
                                })
                                : null;

                        const calculatedPrice = calculatedPriceResult?.totalFormatted ?? "?";

                        // Add additional price (currently only exclusivity if calculated on top)
                        let additionalPriceSummary = "";
                        const additionalPrices: { priceLabel: string, price: number }[] = [];

                        if (calculatedPriceResult?.items) {
                            const priceMap = new Map<string, number>();

                            calculatedPriceResult.items
                                .filter(i => i.ignore === false &&
                                    i.pricingLabel !== undefined &&
                                    i.itemType == "exclusivity")
                                .forEach(i => {
                                    const currentSum = priceMap.get(i.pricingLabel!) || 0;
                                    priceMap.set(i.pricingLabel!, currentSum + i.price);
                                });

                            for (const [priceLabel, price] of priceMap.entries()) {
                                additionalPrices.push({ priceLabel, price });
                            }

                            if (additionalPrices.length > 0) {
                                // Create concatenated string
                                additionalPriceSummary = " + " +
                                    additionalPrices
                                        .map(p =>
                                            `${FormatPrice.formatPriceValue(p.price)}` +
                                            `${FormatPrice.translatePricingLabel(p.priceLabel as PricingLabels)}`
                                        )
                                        .join(", ");
                            }
                        }

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
                                        `${calculatedPrice}` + `${additionalPriceSummary}` +
                                        ` | ${room.minPersons} - ${room.maxPersons} Personen | ` +
                                        [
                                            isExclusive ? 'Exklusiv' : null,
                                            seating ? seatingTypeOptions.find(o => o.value === seating)?.label || seating : null
                                        ].filter(Boolean).join(', ')
                                    }
                                    information={room.description}
                                    additionalNotes={room.services}
                                    infoItems={[
                                        ...(room.size > 0 ? [{ icon: <Ruler color={iconColor} />, label: formatRoomSize(room.size) }] : []),
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
                            const isExclusive = isRoomExclusive(room.id) === true;

                            const calculatedPrice =
                                eventConfiguration?.date &&
                                    eventConfiguration?.endDate &&
                                    eventConfiguration?.persons
                                    ? calculateBookingPrice({
                                        bookingStart: new Date(eventConfiguration.date),
                                        bookingEnd: new Date(eventConfiguration.endDate),
                                        persons: eventConfiguration.persons,
                                        basePrice: room.price,
                                        basePriceType: room.priceType,
                                        basePriceLabel: room.pricingLabel,
                                        excludeExclusive: !isExclusive,
                                        schedules: room.roomPricings,
                                        seatings: room.roomSeatings,
                                        seating: '',
                                        context: "booker",
                                        short: true,
                                        isSingleOperation: true,
                                    }).totalFormatted
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
                                            `${calculatedPrice}` +
                                            `|${room.minPersons} - ${room.maxPersons} Personen`
                                        }
                                        information={room.description}
                                        additionalNotes={room.services}
                                        infoItems={[
                                            ...(room.size > 0 ? [{ icon: <Ruler color={iconColor} />, label: formatRoomSize(room.size) }] : []),
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