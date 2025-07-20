import { EventConfigurationModel, toBooking } from "@/models/EventConfigurationModel";
import { calculateBooking, calculateBookingPrice, FormatPrice } from "@/utils/pricingManager";
import { Box, SxProps, Theme, Typography } from "@mui/material";

interface Props {
    model: EventConfigurationModel;
    showNotes?: boolean;
    sx?: SxProps<Theme>;
}

const EventConfigurationDetails = ({
    model, showNotes, sx
}: Props) => {

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
    const bookingResult = bookingModel && calculateBooking(bookingModel);
    const cateringItems = bookingResult?.items
        .filter(item => item.itemType === 'catering');
    const equipmentItems = bookingResult?.items
        .filter(item => item.itemType === 'equipment');

    console.log(bookingResult);

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Eventdaten</Typography>
            <Typography>{formatDates(model)}</Typography>
            <Typography>{model.persons} Personen</Typography>

            {bookingResult
                ? <><Box sx={{ width: { xs: "90%", sm: "95%" } }}>

                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Rooms & Tables</Typography>

                    {bookingResult.items
                        .filter((item) => item.itemType === "room")
                        .map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 1,
                                    width: "100%",
                                    justifyContent: "space-between",
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body2" sx={{ flex: "0 0 3%", fontSize: { xs: 12, sm: 14 }, }}><strong>{item.pos}.</strong></Typography>

                                <Box sx={{ flex: "0 0 47%", fontSize: { xs: 12, sm: 14 } }}>
                                    <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 } }}><strong>{item.name}</strong></Typography>
                                    <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 } }}>
                                        {item.items?.map((subItem) => subItem.name).join(", ") || ""}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" sx={{ flex: "0 0 10%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.quantity} Stk</Typography>

                                <Typography variant="body2" sx={{ flex: "0 0 20%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.unitPriceFormatted}</Typography>

                                <Typography variant="body2" sx={{ flex: "0 0 20%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.priceFormatted}</Typography>
                            </Box>
                        ))
                    }

                    {cateringItems && cateringItems.length > 0 &&
                        <>
                            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Food & Beverages</Typography>
                            {cateringItems
                                .map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            gap: 1,
                                            width: "100%",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ flex: "0 0 3%", fontSize: { xs: 12, sm: 14 }, }}><strong>{item.pos}.</strong></Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 47%", fontSize: { xs: 12, sm: 14 } }}><strong>{item.name}</strong></Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 10%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.quantity} Stk</Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 20%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.unitPriceFormatted}</Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 20%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.priceFormatted}</Typography>
                                    </Box>
                                ))
                            }
                        </>
                    }

                    {equipmentItems && equipmentItems.length > 0 &&
                        <>
                            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Look & Feel</Typography>
                            {equipmentItems
                                .map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            gap: 1,
                                            width: "100%",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ flex: "0 0 3%", fontSize: { xs: 12, sm: 14 } }}><strong>{item.pos}.</strong></Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 47%", fontSize: { xs: 12, sm: 14 } }}><strong>{item.name}</strong></Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 10%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.quantity} Stk</Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 20%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.unitPriceFormatted}</Typography>

                                        <Typography variant="body2" sx={{ flex: "0 0 20%", fontSize: { xs: 12, sm: 14 }, textAlign: "right" }}>{item.priceFormatted}</Typography>
                                    </Box>
                                ))}
                        </>}
                </Box>
                    <Typography sx={{ fontWeight: 'bold', fontSize: { xs: 12, sm: 14 }, textAlign: 'right', width: "100%", mt: 2 }}>
                        Gesamt: {FormatPrice.formatPriceValue(bookingResult.total)}
                    </Typography>
                </>
                : <Typography sx={{ color: 'red', fontWeight: 'bold', mt: 2 }}>
                    Keine Daten
                </Typography>
            }

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
