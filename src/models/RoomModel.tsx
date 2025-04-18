import { PriceTypes } from "@/constants/PriceTypes";
import { RoomPricingModel } from "./RoomPricingModel";
import { RoomSeatingModel } from "./RoomSeatingModel";

export interface RoomModel {
    id: number;
    locationId: number;
    name: string;
    description: string;
    size: number;
    price: number;
    priceType: PriceTypes;
    minPersons: number;
    maxPersons: number;
    images: string[];
    eventCategories: string[];
    roomConfigurations: RoomConfigurationModel[];
    roomPricings?: RoomPricingModel[];
    roomSeatings?: RoomSeatingModel[];
    RoomsEventConfigurations?: {
        isExclusive: boolean;
    };
}

export const createEmptyRoomModel = (locationId: number): RoomModel => ({
    id: 0,
    locationId: locationId,
    name: '',
    description: '',
    size: 0,
    price: 0,
    priceType: 'day',
    minPersons: 0,
    maxPersons: 0,
    images: [],
    eventCategories: [],
    roomConfigurations: [],
})