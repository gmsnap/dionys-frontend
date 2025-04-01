import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Button, Typography } from '@mui/material';
import router from "next/router";
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import { CircleCheckBig } from 'lucide-react';
import { useHeaderContext } from '@/components/headers/PartnerHeaderContext';
import { useAuthContext } from '@/auth/AuthContext';
import { createPartnerUser } from '@/services/partnerService';
import useStore from '@/stores/partnerStore';

const PartnerPage: NextPageWithLayout = () => {
    const { authUser } = useAuthContext();
    const { setIsOnboardingOverlayOpen } = useHeaderContext();
    const { setPartnerUser } = useStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authUser?.username) {
            const fetchUserData = async () => {
                await createPartnerUser(authUser,
                    (result) => {
                        setPartnerUser(result);
                    },
                    (message) => {
                        setError("Fehler: " + (message ?? "unbekannter Fehler"));
                        setPartnerUser(null);
                    }
                );
            }

            fetchUserData();
            return;
        }

        setPartnerUser(null);
        setError("User nicht authentifiziert.");
    }, [authUser]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6
        }}
        >
            <CircleCheckBig size={120} color='#002A58' />
            <Typography variant='h3'>Danke für deine Zahlung</Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setIsOnboardingOverlayOpen(1);
                        router.push('/partner/events');
                    }}
                >
                    Jetzt Location onboarden
                </Button>
            </Box>
        </Box>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>
        <PartnerContentLayout>
            {page}
        </PartnerContentLayout>
    </PartnerLayout>;
};

export default PartnerPage;