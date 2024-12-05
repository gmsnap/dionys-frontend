export interface RoomModel {
    id: number;
    venueId: number;
    name: string;
    size: number;
    price: number;
    minPersons: number;
    maxPersons: number;
    images: string[];
    roomConfigurations: RoomConfigurationModel[];
}

export const createEmptyRoomModel = (venueId: number): RoomModel => ({
    id: 0,
    venueId: venueId,
    name: '',
    size: 0,
    price: 0,
    minPersons: 0,
    maxPersons: 0,
    images: [],
    roomConfigurations: [],
})