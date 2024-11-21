interface RoomModel {
    id: number;
    venueId: number;
    name: string;
    size: number;
    images: string[];
    roomConfigurations: RoomConfigurationModel[];
}