import { EventConfigurationModel, toBooking } from "@/models/EventConfigurationModel";
import { calculateTotalPrice } from "@/services/eventConfigurationService";
import { formatPrice, formatPriceWithType } from "@/utils/formatPrice";
import { calculateBooking, calculateBookingPrice } from "@/utils/pricingManager";
import { Box, SxProps, Theme, Typography } from "@mui/material";

interface Props {
    model: EventConfigurationModel;
    showNotes?: boolean;
    sx?: SxProps<Theme>;
}

const EventConfigurationDetails = ({
    model, showNotes, sx
}: Props) => {

    const formatLocation = (conf: EventConfigurationModel) => {
        const location = conf.location;
        if (!location) return '?';
        return location.title;
    }

    const formatRooms = (conf: EventConfigurationModel) => {
        const rooms = conf.rooms;
        if (!rooms || !conf.date || !conf.endDate) return <Typography>?</Typography>;

        const startDate = new Date(conf.date);
        const endDate = new Date(conf.endDate);

        return rooms.map(room => {
            const name = room.name ?? "?";
            const price = formatPrice(
                calculateBookingPrice(
                    startDate,
                    endDate,
                    conf.persons ?? 1,
                    room.price,
                    room.priceType,
                    room.roomPricings,
                )
            );
            return (
                <Typography key={name}>
                    {name}: {price}
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

    const bookingModel = toBooking(model);

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Eventdaten</Typography>
            <Typography>{formatDates(model)}</Typography>
            <Typography>{model.persons} Personen</Typography>
            <Typography>{formatRooms(model)}</Typography>

            {model.packages &&
                <>
                    <Typography variant="h5" sx={{ mt: 2 }}>Pakete</Typography>
                    {model.packages.map((item, index) => (
                        <Box key={index} sx={{}}>
                            <Typography>{item.title} ({formatPriceWithType(item.price, item.priceType)})</Typography>
                        </Box>
                    ))}
                </>
            }
            {bookingModel
                ? <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
                    Gesamt: {formatPrice(calculateBooking(bookingModel))}
                </Typography>
                : <Typography sx={{ color: 'red', fontWeight: 'bold', mt: 2 }}>
                    Gesamtpreis kann nicht berechnet werden.
                </Typography>}
            {model.booker &&
                <>
                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Persönliche Daten</Typography>
                    <Typography>
                        {`${model.booker?.givenName ?? ''} ${model.booker?.familyName ?? ''}`}
                    </Typography>
                    <Typography>{model.booker?.email ?? 'no email'}</Typography>
                    {model.booker.bookingCompany &&
                        <>
                            <Typography variant="h5" sx={{ mt: 2 }}>Unternehmen</Typography>
                            <Typography>{getCompanyName(model)}</Typography>
                            <Typography>{getCompanyStreet(model)}</Typography>
                            <Typography>{getCompanyCity(model)}</Typography>
                        </>
                    }
                </>
            }

            {showNotes && model.notes &&
                <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="h5">Sonderwünsche und Hinweise</Typography>
                    <Typography>{model.notes}</Typography>
                </Box>
            }
        </Box>
    );
};

export default EventConfigurationDetails;
