import { ReactElement, useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import PartnerLayout from '@/layouts/PartnerLayout';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';
import { useHeaderContext } from "@/components/headers/PartnerHeaderContext";
import { fetchEventConfigurationsByCompany } from '@/services/eventConfigurationService';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import EventConfigurationDetails from '@/features/partners/EventConfigurationDetails';
import EventCalendar, { CalendarEvent } from '@/features/partners/EventCalendar';
import theme from '@/theme';
import { CalendarIcon, List as ListIcon } from 'lucide-react';
import { formatEventCategoryStringSync } from '@/utils/formatEventCategories';
import { onboardingCompleted } from '@/services/onboardingService';
import OnboardingIndicator from '@/features/partners/OnboardingIndicator';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser } = useStore();
    const { partnerLocations } = useStore();
    const { setIsOnboardingOverlayOpen } = useHeaderContext();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [eventConfs, setEventConfs] = useState<EventConfigurationModel[] | null>(null);
    const [selectedConf, setSelectedConf] = useState<EventConfigurationModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [currenTab, setCurrenTab] = useState(2);


    // Handle date range changes from the calendar
    const handleDateRangeChange = (newRange: any) => {
        setDateRange(newRange);
    };

    const fetchConfigurationsFromApi = async (selected: number | null | undefined = undefined) => {
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }

        const confs = await fetchEventConfigurationsByCompany(
            companyId,
            setIsLoading,
            setError
        );

        if (!confs) {
            setEventConfs([]);
            setError("Error fetching Event Bookings");
            return;
        }

        // Set rooms to state
        setEventConfs(confs);
        setError(null);
    };

    useEffect(() => {
        setIsLoggedIn(!!partnerUser);
    }, [partnerUser]);

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchConfigurationsFromApi();
    }, [isLoggedIn]);

    useEffect(() => {
        if (!eventConfs) {
            return;
        }
        const events: CalendarEvent[] = eventConfs.map((e): CalendarEvent => ({
            id: e.id,
            title: `${formatEventCategoryStringSync(e.eventCategory ?? '')}  (ID-${e.id})`,
            start: e.date ? new Date(e.date) : new Date(),
            end: e.endDate ? new Date(e.endDate) : new Date(),
            persons: e.persons ?? 0,
            location: e.location?.title ?? '?',
            rooms: e.rooms && e.rooms.length > 0
                ? e.rooms.map((r) => r.name)
                : [],
            color: theme.palette.customColors.blue.contrast,
        }));
        setCalendarEvents(events);
    }, [eventConfs]);

    useEffect(() => {
        if (partnerUser &&
            partnerLocations &&
            onboardingCompleted(partnerUser, partnerLocations)
        ) {
            setShowOnboarding(false);
            return;
        }
        setShowOnboarding(true);
    }, [partnerUser, partnerLocations]);

    if (!partnerUser) {
        return (
            <Box>
                <Typography>Please Login</Typography>
            </Box>
        );
    }

    const formatTitle = (conf: EventConfigurationModel) => {
        const location = conf.location?.title ?? "?";
        const company = conf.booker?.bookingCompany?.companyName ?? "?";
        return `Location: ${location}, Anfrage von: ${company}`;
    }

    const formatDates = (conf: EventConfigurationModel) => {
        const startDate = conf.date
            ? new Intl.DateTimeFormat('de-DE').format(new Date(conf.date))
            : '?';
        const startTime = conf.date
            ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.date))
            : '?';
        const endTime = conf.endDate
            ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.endDate))
            : '?';
        return `${startDate}, ${startTime} - ${endTime} Uhr`;
    }

    return (
        <Box>
            {/* Onboarding with Headline */}
            {showOnboarding && (
                <>
                    {/* Headline */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <Typography
                            variant='h3'
                            sx={{
                                fontFamily: "'Arial', sans-serif",
                                ml: 3,
                            }}
                        >
                            Onboarding
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            borderTop: (theme) => `1px solid ${theme.palette.customColors.blue.halfdark}`,
                            width: '100%',
                            mt: 3,
                        }}
                    />
                    <Box
                        sx={{
                            mt: { xs: 4, md: 4 },
                            display: 'flex',
                            flexDirection: 'row',
                            justifyItems: 'center',
                            gap: 1,
                            ml: 2,
                            mb: 6,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}>
                            <Typography>Jetzt die letzten Einrichtungsschritte erledigen</Typography>
                            <OnboardingIndicator
                                sx={{ cursor: 'pointer', }}
                                onClick={() => setIsOnboardingOverlayOpen(true)}
                            />
                        </Box>
                    </Box>
                </>
            )}

            {/* Content with Headline */}
            <>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <Typography
                        variant='h3'
                        sx={{
                            fontFamily: "'Arial', sans-serif",
                            ml: 3,
                        }}
                    >
                        Dashboard
                    </Typography>
                </Box>
                <Box
                    sx={{
                        borderTop: (theme) => `1px solid ${theme.palette.customColors.blue.halfdark}`,
                        width: '100%',
                        mt: 3,
                    }}
                />
            </>
            <Box sx={{
                mt: { xs: 5, md: 10 },
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                ml: 2,
                mb: 5
            }}>
                <Button
                    variant='contained'
                    onClick={(e) => { e.preventDefault(); setCurrenTab(1); }}
                >
                    <CalendarIcon color={'white'} />
                    <Typography sx={{ ml: 1, fontWeight: 700, fontSize: '12px' }}>
                        Event-Kalender
                    </Typography>
                </Button>
                <Button
                    variant='contained'
                    onClick={(e) => { e.preventDefault(); setCurrenTab(2); }}
                >
                    <ListIcon color={'white'} />
                    <Typography sx={{ ml: 1, fontWeight: 700, fontSize: '12px' }}>
                        Events (Liste)
                    </Typography>
                </Button>
            </Box>

            {currenTab == 1 &&
                <EventCalendar
                    events={calendarEvents}
                    onDateRangeChange={handleDateRangeChange}
                />
            }

            {currenTab == 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'row', mt: 5 }}>
                    {eventConfs && eventConfs?.length > 0 ?
                        (
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant='h6' sx={{ mt: 0, mb: 2, pl: 2, pr: 2, }}>
                                    Aktuelle Event-Anfragen
                                </Typography>
                                <List
                                    sx={{
                                        mr: { xs: 1, sm: 3 },
                                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                                    }}
                                >
                                    {eventConfs &&
                                        eventConfs.map((p, index) => (
                                            <ListItem
                                                key={p.id}
                                                disablePadding
                                                sx={{
                                                    ml: { xs: 0, sm: 2 },
                                                    backgroundColor: index % 2 === 0 ? '#EEE' : 'white',
                                                }}
                                            >
                                                <ListItemButton
                                                    onClick={() => {
                                                        setSelectedConf(p);
                                                    }}
                                                    sx={{
                                                        pt: { xs: 0, sm: 'unset' },
                                                        pb: { xs: 0, sm: 'unset' },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={formatTitle(p)}
                                                        primaryTypographyProps={{
                                                            sx: {
                                                                fontSize: { xs: '12px', sm: '16px' },
                                                            },
                                                        }}
                                                        secondary={formatDates(p)}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                </List>
                            </Box>
                        ) : (
                            <Typography sx={{ mt: 0, mb: 2, pl: 2, pr: 2, }}>
                                Derzeit liegen keine Event-Anfragen für Ihre Locations vor.
                            </Typography>
                        )
                    }

                    {selectedConf &&
                        <EventConfigurationDetails
                            model={selectedConf}
                            sx={{ flexGrow: 1, mt: 7, ml: 4, p: 5, backgroundColor: '#EEEEEE' }}
                        />
                    }
                </Box>
            )}
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default PartnerPage;