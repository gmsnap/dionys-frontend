import { PartnerUserModel } from "@/models/PartnerUserModel";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const subscriptionsUrl = `${baseUrl}/partner/subscriptions/`;

export const createCheckoutSession = async (
    idToken: string,
    successUrl: string,
    cancelUrl: string,
    period?: string,
    email?: string,
    onSuccess?: (url: string) => void,
    onError?: () => void,
): Promise<void> => {
    try {
        let priceId: string | null;
        let priceKey: string;

        if (period === 'annual') {
            priceId = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE || null;
            priceKey = "STRIPE_ANNUAL_PRICE";
        } else {
            priceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE || null;
            priceKey = "STRIPE_MONTHLY_PRICE";
        }

        if (!priceId) {
            onError?.();
            return;
        }

        const response = await fetch(`${subscriptionsUrl}/create-checkout-session`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    priceId,
                    priceKey,
                    successUrl,
                    cancelUrl,
                    email,
                }),
            });

        const { url } = await response.json();

        if (response.ok) {
            console.log('Event Package deleted successfully');
            onSuccess?.(url);
        } else {
            const errorMessage = await response.text();
            console.error('Failed to create Event Package:', errorMessage);
            onError?.();
        }
    } catch (error) {
        console.error('Error creating Event Package:', error);
        onError?.();
    }
};

export const hasSubscription = (partnerUser: PartnerUserModel): boolean => {
    if (!partnerUser) {
        return false;
    }

    return (
        !!partnerUser.company?.subscription ||
        partnerUser.email?.endsWith("@dionys.ai") ||
        partnerUser.email?.endsWith("@pingponglabs.de") ||
        partnerUser.email?.includes("gregor.matte") ||
        partnerUser.email?.includes("@urbanridersgame.com") ||
        partnerUser.email?.includes("@playparadice.com") ||
        partnerUser.email?.includes("ekkehard@ory.bar")
    );
};
