import { PriceTypes } from "@/constants/PriceTypes";
import { EventConfigurationModel } from "@/models/EventConfigurationModel";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const evntConfUrl = `${baseUrl}/eventConfigurations`;

export const fetchEventConfigurationsByCompany = async (
    companyId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);

        const response =
            await fetch(`${evntConfUrl}/company/${companyId}`);

        if (response.status === 404) {
            setIsLoading(false);
            return [];
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setError(null);
        return result || [];
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        return null;
    } finally {
        setIsLoading(false);
    }
}

const multiplyPriceByPriceType = (price: number,
    priceType: PriceTypes,
    h: number,
    p: number
) => {
    if (priceType === 'hour') {
        return price * h;
    } else if (priceType === 'person') {
        return price * p;
    }
    return price;
}

export const calculateTotalPrice = (conf: EventConfigurationModel) => {
    let diffInHours = 0;
    if (conf.date && conf.endDate) {
        const date = new Date(conf.date);
        const endDate = new Date(conf.endDate);

        const diffInMs = endDate.getTime() - date.getTime();
        diffInHours = diffInMs / (1000 * 60 * 60);
    }

    //console.log("diffInHours", diffInHours);

    const persons = conf.persons ?? 0;

    const roomsPrice = conf.rooms?.reduce((total, room) => {
        const roomPrice = room
            ? multiplyPriceByPriceType(
                room.price,
                room.priceType,
                diffInHours,
                persons)
            : 0;
        return total + roomPrice;
    }, 0) || 0;

    let packagePrice = 0;
    if (conf.packages) {
        conf.packages.forEach(p => {
            packagePrice += multiplyPriceByPriceType(
                p.price,
                p.priceType,
                diffInHours,
                persons);
        });
    }

    return roomsPrice + packagePrice;
}