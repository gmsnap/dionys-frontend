export interface RoomSeatingModel {
    id: number;
    roomId: number;
    seating: string;
    priceType: string;
    isAbsolute: boolean;
    price: number;
    pricingLabel: string;
    reconfigPriceType: string;
    reconfigIsAbsolute: boolean | null;
    reconfigPrice: number | null;
    reconfigPricingLabel: string;
    isDefault: boolean;
}

export const createEmptyRoomSeatingModel = (roomId: number): RoomSeatingModel => ({
    id: 0,
    roomId: roomId,
    seating: "mixed",
    priceType: "hour",
    isAbsolute: true,
    price: 0,
    pricingLabel: "exact",
    reconfigPriceType: "none",
    reconfigIsAbsolute: true,
    reconfigPrice: 0,
    reconfigPricingLabel: "exact",
    isDefault: false,
});