import { ReactElement, useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types/page';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import PartnerLayout from '@/layouts/PartnerLayout';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import useStore from '@/stores/partnerStore';
import { fetchEventConfigurationsByCompany } from '@/services/eventConfigurationService';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import EventConfigurationDetails from '@/features/partners/EventConfigurationDetails';

const PartnerPage: NextPageWithLayout = () => {
    const { partnerUser } = useStore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [eventConfs, setEventConfs] = useState<EventConfigurationModel[] | null>(null);
    const [selectedConf, setSelectedConf] = useState<EventConfigurationModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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

    if (!partnerUser) {
        return (
            <Box>
                <Typography>Please Login</Typography>
            </Box>
        );
    }

    const formatTitle = (conf: EventConfigurationModel) => {
        const room = conf.room?.name ?? "?";
        const company = conf.booker?.bookingCompany?.companyName ?? "?";
        return `Raum: ${room}, Anfrage von: ${company}`;
    }

    const formatDates = (conf: EventConfigurationModel) => {
        const startDate = conf.date ? new Intl.DateTimeFormat('de-DE').format(new Date(conf.date)) : '?';
        const startTime = conf.date ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.date)) : '?';
        const endTime = conf.endDate ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(conf.endDate)) : '?';
        return `${startDate}, ${startTime} - ${endTime} Uhr`;
    }

    return (
        <Box>
            <Typography variant='h6' sx={{ mt: 0, mb: 2, pl: 2, pr: 2, }}>
                Willkommen, {partnerUser.givenName} {partnerUser.familyName}!
            </Typography>

            {eventConfs && eventConfs?.length > 0 ?
                (
                    <List sx={{
                        mr: { xs: 1, sm: 3 },
                        minWidth: { xs: '100px', sm: '200px', md: '250px' },
                    }}>

                        {eventConfs && eventConfs.map((p) => (
                            <ListItem
                                key={p.id}
                                disablePadding
                                sx={{
                                    ml: { xs: 0, sm: 2 },
                                }}
                            >
                                <ListItemButton
                                    onClick={() => { setSelectedConf(p); }}
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
                                            }
                                        }}
                                        secondary={formatDates(p)}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}

                    </List>
                ) : (
                    <Typography sx={{ mt: 0, mb: 2, pl: 2, pr: 2, }}>
                        Derzeit liegen keine Event-Anfragen für Ihre Locations vor.
                    </Typography>
                )
            }

            {selectedConf &&
                <EventConfigurationDetails model={selectedConf} sx={{ mt: 4, ml: 4 }} />
            }
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>
            <PartnerContentLayout title='Events'>
                {page}
            </PartnerContentLayout>
        </PartnerLayout>
    );
};

export default PartnerPage;