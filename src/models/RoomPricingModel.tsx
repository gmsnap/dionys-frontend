import { PriceTypes } from "@/constants/PriceTypes";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RoomPricingModel {
    id: number;
    roomId: number;
    startDayOfWeek: DayOfWeek;
    startTime: string;  // 'HH:MM:SS'
    endDayOfWeek: DayOfWeek;
    endTime: string;    // 'HH:MM:SS'
    price: number;
    priceType: string;
    exclusivePossible: boolean;
    exclusiveMandatory: boolean;
}

export const createEmptyRoomPricingModel = (roomId: number): RoomPricingModel => ({
    id: 0,
    roomId: roomId,
    startDayOfWeek: 0,
    startTime: "",
    endDayOfWeek: 0,
    endTime: "",
    price: 0,
    priceType: "hour",
    exclusivePossible: true,
    exclusiveMandatory: false
})