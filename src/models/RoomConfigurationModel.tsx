interface RoomConfigurationModel {
    id: number;
    roomId: number;
    name: string;
    images: string[];
    roomItems: RoomItemModel[];
}