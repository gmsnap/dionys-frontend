import { PricingSlot } from "@/utils/pricingManager";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RoomPricingModel {
    id: number;
    roomId: number;
    roomPricingType: string;
    startDayOfWeek: DayOfWeek;
    startTime: string;  // 'HH:MM:SS'
    endDayOfWeek: DayOfWeek;
    endTime: string;    // 'HH:MM:SS'
    price: number;
    priceType: string;
    pricingLabel: string;
    exclusiveType: string;
    exclusivePriceType: string | null;
    exclusivePrice: number | null;
    exclusivePricingLabel: string;
    customName?: string;
}

export const createEmptyRoomPricingModel = (roomId: number): RoomPricingModel => ({
    id: 0,
    roomId: roomId,
    roomPricingType: "basic",
    startDayOfWeek: 0,
    startTime: "",
    endDayOfWeek: 0,
    endTime: "",
    price: 0,
    priceType: "hour",
    pricingLabel: "exact",
    exclusiveType: "optional",
    exclusivePriceType: "none",
    exclusivePrice: null,
    exclusivePricingLabel: "exact",
})

export const toPricingSlot = (roomPricing: RoomPricingModel): PricingSlot => {
    return {
        roomPricingType: roomPricing.roomPricingType,
        startDayOfWeek: roomPricing.startDayOfWeek,
        startTime: roomPricing.startTime,
        endDayOfWeek: roomPricing.endDayOfWeek,
        endTime: roomPricing.endTime,
        price: roomPricing.price,
        priceType: roomPricing.priceType,
        pricingLabel: roomPricing.pricingLabel,
        exclusiveType: roomPricing.exclusiveType,
        exclusivePriceType: roomPricing.exclusivePriceType,
        exclusivePrice: roomPricing.exclusivePrice,
    };
};