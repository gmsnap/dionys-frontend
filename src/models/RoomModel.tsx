interface RoomModel {
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