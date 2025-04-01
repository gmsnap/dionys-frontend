import { EventConfigurationModel, toBooking } from "@/models/EventConfigurationModel";
import { deleteEventConfiguration } from "@/services/eventConfigurationService";
import { formatPrice, formatPriceWithType } from "@/utils/formatPrice";
import { Box, Button, SxProps, Theme, Typography } from "@mui/material";
import { X } from "lucide-react";
import { useAuthContext } from '@/auth/AuthContext';
import { BookingRoom, calculateBooking, calculateBookingPrice, PricingSlot } from "@/utils/pricingManager";
import { useEffect, useState } from "react";
import { fetchRoomPricingsByRoom } from "@/services/roomPricingService";
import { RoomPricingModel, toPricingSlot } from "@/models/RoomPricingModel";

interface Props {
    model: EventConfigurationModel;
    onDeleted?: () => void;
    sx?: SxProps<Theme>;
}

const EventConfigurationDetails = ({ model, onDeleted, sx }: Props) => {
    const { authUser } = useAuthContext();
    const [roomPricings, setRoomPricings] = useState<RoomPricingModel[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatLocation = (conf: EventConfigurationModel) => {
        const location = conf.location;
        if (!location) return '?';
        return location.title;
    }

    const formatRooms = (conf: EventConfigurationModel) => {
        const rooms = conf.rooms;

        if (!(rooms && conf && conf.date && conf.endDate && conf.persons)) {
            return <Typography>?</Typography>;
        }

        return rooms.map((room) => {
            const pricings = roomPricings?.filter((p) => p.roomId === room.id);
            const name = room.name ?? "?";
            const price = formatPrice(
                calculateBookingPrice(
                    new Date(conf.date!),
                    new Date(conf.endDate!),
                    conf.persons!,
                    room.price,
                    room.priceType,
                    conf.roomExclusiveIds?.includes(room.id) === true,
                    pricings ?? undefined
                )
            );
            const isExclusive = room.RoomsEventConfigurations?.isExclusive === true;
            return (
                <Typography key={name}>
                    {name} ({price}, exklusiv: {isExclusive ? "ja" : "nein"})
                </Typography>
            );
        });
    };

    const getCompanyName = (conf: EventConfigurationModel) => {
        const company = conf.booker?.bookingCompany;
        if (!company) return '?';
        return company.companyName;
    }

    const getCompanyStreet = (conf: EventConfigurationModel) => {
        const company = conf.booker?.bookingCompany;
        if (!company) return '?';
        return company.streetAddress;
    }

    const getCompanyCity = (conf: EventConfigurationModel) => {
        const company = conf.booker?.bookingCompany;
        if (!company) return '?';
        return company.city;
    }

    const formatDates = (conf: EventConfigurationModel) => {
        const startDate = conf.date ? new Intl.DateTimeFormat('de-DE').format(new Date(conf.date)) : '?';
        const startTime = conf.date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.date)) : '?';
        const endTime = conf.endDate ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.endDate)) : '?';
        return `${startDate}, ${startTime} - ${endTime} Uhr`;
    }

    const handleDelete = async () => {
        if (!authUser?.idToken) return;

        await deleteEventConfiguration(
            authUser.idToken,
            model.id,
            () => onDeleted?.(),
        );
    }

    const updateRoomPricing = (
        rooms: BookingRoom[],
        roomPricings: RoomPricingModel[],

    ) => {
        rooms.forEach(room => {
            // Find matching pricing from roomPricings
            const matchingPricing = roomPricings
                .filter(p => p.roomId === room.id)
                .map(p => toPricingSlot(p));
            if (matchingPricing.length > 0) {
                room.roomPricings = matchingPricing; // Assign converted pricing array
            }
        });
    };

    useEffect(() => {
        if (model.rooms && model.rooms.length > 0) {
            const fetchPricings = async () => {
                const ids = model.rooms?.map(r => r.id);
                if (Array.isArray(ids)) {
                    const pricings = await fetchRoomPricingsByRoom(ids);
                    if (pricings) {
                        setRoomPricings(pricings);
                        return;
                    }
                }
                setRoomPricings([]);
            };
            fetchPricings();
        } else {
            setRoomPricings([]);
        }
    }, [model]);

    useEffect(() => {
        if (roomPricings !== null) {
            setIsLoading(false);
        }
    }, [roomPricings]);

    if (isLoading) {
        return (
            <Box sx={{ ...sx }}>
                <Typography variant="h6">Buchung ID-{model.id}</Typography>
            </Box>
        );
    }

    const bookingModel = toBooking(model);
    if (Array.isArray(bookingModel?.rooms) && Array.isArray(roomPricings)) {
        updateRoomPricing(bookingModel.rooms, roomPricings);
    }
    console.log(bookingModel);

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h6">Buchung ID-{model.id}</Typography>

            <Typography variant="h5" sx={{ mt: 2 }}>Event</Typography>
            <Typography>{formatDates(model)}</Typography>
            <Typography>{model.persons} Personen</Typography>
            <Typography>{formatLocation(model)}</Typography>
            <Typography>{formatRooms(model)}</Typography>

            <Typography variant="h5" sx={{ mt: 2 }}>Pakete</Typography>
            {model.packages && model.packages.map((item, index) => (
                <Box key={index} sx={{}}>
                    <Typography>{item.title} ({formatPriceWithType(item.price, item.priceType)})</Typography>
                </Box>
            ))}

            <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
                Total: {bookingModel
                    ? formatPrice(calculateBooking(bookingModel))
                    : "Nicht berechnet"}
            </Typography>
            {model.booker && (<>
                <Typography variant="h5" sx={{ mt: 2 }}>Kontaktdaten</Typography>
                <Typography>{model.booker.givenName} {model.booker.familyName}</Typography>
                <Typography>{model.booker.email}</Typography>
                <Typography>Tel.: {model.booker.phoneNumber}</Typography>
                {model.booker.bookingCompany && <>
                    <Typography variant="h5" sx={{ mt: 2 }}>Unternehmen</Typography>
                    <Typography>{getCompanyName(model)}</Typography>
                    <Typography>{getCompanyStreet(model)}</Typography>
                    <Typography>{getCompanyCity(model)}</Typography>
                </>}
            </>)}

            <Typography variant="h5" sx={{ mt: 2 }}>Kommentar</Typography>
            <Typography>{model.notes}</Typography>

            <Button
                variant="delete"
                onClick={handleDelete}
                sx={{ mt: 5 }}
            >
                Dauerhaft Löschen
                <Box component="span" sx={{ ml: 1 }}>
                    <X className="icon" width={16} height={16} />
                </Box>
            </Button>
        </Box>
    );
};

export default EventConfigurationDetails;
