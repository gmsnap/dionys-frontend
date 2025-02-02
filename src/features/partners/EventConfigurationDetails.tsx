import { EventConfigurationModel } from "@/models/EventConfigurationModel";
import { calculateTotalPrice } from "@/services/eventConfigurationService";
import { formatPrice, formatPriceWithType } from "@/utils/formatPrice";
import { Box, SxProps, Theme, Typography } from "@mui/material";

interface Props {
    model: EventConfigurationModel;
    sx?: SxProps<Theme>;
}

const EventConfigurationDetails = ({
    model, sx
}: Props) => {

    const formatLocation = (conf: EventConfigurationModel) => {
        const location = conf.location;
        if (!location) return '?';
        return location.title;
    }

    const formatRoom = (conf: EventConfigurationModel) => {
        const room = conf.room;
        if (!room) return '?';
        const name = room.name ?? "?";
        const price = formatPriceWithType(room.price, room.priceType);
        const company = conf.booker?.bookingCompany?.companyName ?? "?";
        return `${name} (${price})`;
    }

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

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h6">Buchung ID-{model.id}</Typography>

            <Typography variant="h5" sx={{ mt: 2 }}>Event</Typography>
            <Typography>{formatDates(model)}</Typography>
            <Typography>{model.persons} Personen</Typography>
            <Typography>{formatLocation(model)}</Typography>
            <Typography>{formatRoom(model)}</Typography>

            <Typography variant="h5" sx={{ mt: 2 }}>Pakete</Typography>
            {model.packages && model.packages.map((item, index) => (
                <Box key={index} sx={{}}>
                    <Typography>{item.title} ({formatPriceWithType(item.price, item.priceType)})</Typography>
                </Box>
            ))}

            <Typography sx={{ fontWeight: 'bold', mt: 2 }}>Total: {formatPrice(calculateTotalPrice(model))}</Typography>

            <Typography variant="h5" sx={{ mt: 2 }}>Unternehmen</Typography>
            <Typography>{getCompanyName(model)}</Typography>
            <Typography>{getCompanyStreet(model)}</Typography>
            <Typography>{getCompanyCity(model)}</Typography>
            <Typography>{model.booker?.email ?? 'no email'}</Typography>

            <Typography variant="h5" sx={{ mt: 2 }}>Kommentar</Typography>
            <Typography>{model.notes}</Typography>
        </Box>
    );
};

export default EventConfigurationDetails;
