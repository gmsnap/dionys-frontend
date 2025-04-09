export interface RoomSeatingModel {
    id: number;
    roomId: number;
    seating: string;
    priceType: string;
    isAbsolute: boolean;
    price: number;
    reconfigPriceType: string;
    reconfigIsAbsolute: boolean | null;
    reconfigPrice: number | null;
}

export const createEmptyRoomSeatingModel = (roomId: number): RoomSeatingModel => ({
    id: 0,
    roomId: roomId,
    seating: "mixed",
    priceType: "hour",
    isAbsolute: true,
    price: 0,
    reconfigPriceType: "none",
    reconfigIsAbsolute: true,
    reconfigPrice: 0,
});