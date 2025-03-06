import { useAuthContext } from "@/auth/AuthContext";
import { createCheckoutSession } from "@/services/paymentService";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import useStore from '@/stores/partnerStore';

const PaymentComponent = () => {
    const { authUser } = useAuthContext();
    const { partnerUser } = useStore();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (period?: string) => {
        if (loading || !authUser?.idToken) {
            return;
        }

        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }

        setLoading(true);

        const currentDomain = window.location.origin;

        await createCheckoutSession(
            authUser.idToken,
            `${currentDomain}/partner/payment-success`,
            `${currentDomain}`,
            period,
            partnerUser?.company?.contactEmail ?? undefined,
            (url: string) => { window.location.href = url; },
            () => { setLoading(false); },
        );
    }

    const monthlyText = <Typography>
        <strong>€200 / Monat</strong><br />
        (monatlich kündbar)
    </Typography>;

    const annualText = <Typography>
        <strong>€2.160 / Jahr</strong><br />
        (10% rabattiert, jährlich kündbar)
    </Typography>;

    const unknowText = <Typography>
        <strong>€2.160 / Jahr</strong><br />
        (10% rabattiert, jährlich kündbar)
    </Typography>;

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            maxWidth: '350px',
            textAlign: 'center'
        }}
        >
            {partnerUser?.company?.subscription
                ? <>
                    <Typography>
                        Aktuelles Abonnement:<br />
                    </Typography>
                    {partnerUser?.company?.subscription?.priceKey === "STRIPE_MONTHLY_PRICE"
                        ? monthlyText
                        : partnerUser?.company?.subscription?.priceKey === "STRIPE_ANNUAL_PRICE"
                            ? annualText
                            : unknowText}
                </>
                : <>
                    {monthlyText}
                    <Button
                        variant="contained"
                        onClick={() => handleCheckout()}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Zur Zahlung (monatlich)"}
                    </Button>
                    {annualText}
                    <Button
                        variant="contained"
                        onClick={() => handleCheckout("annual")}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Zur Zahlung (jährlich)"}
                    </Button>
                </>
            }

        </Box>
    );
};

export default PaymentComponent;