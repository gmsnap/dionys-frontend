import { RoomPricingModel } from "./RoomPricingModel";
import { RoomSeatingModel } from "./RoomSeatingModel";
import { PriceTypes, PricingLabels } from "@/utils/pricingManager";

export interface RoomModel {
    id: number;
    locationId: number;
    name: string;
    description: string;
    size: number;
    price: number;
    priceType: PriceTypes;
    pricingLabel: PricingLabels;
    minPersons: number;
    maxPersons: number;
    images: string[];
    eventCategories: string[];
    roomConfigurations: RoomConfigurationModel[];
    services: string | null;
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
    pricingLabel: 'exact',
    minPersons: 0,
    maxPersons: 0,
    images: [],
    eventCategories: [],
    roomConfigurations: [],
    services: null,
})