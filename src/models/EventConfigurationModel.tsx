import { EventCategories } from "@/constants/EventCategories";
import { RoomModel } from "./RoomModel";

export interface EventConfigurationModel {
    locationId: number;
    roomId: number;
    room: RoomModel | null;
    occasion: EventCategories | null;
    persons: number;
    roomConfigurationId: number;
    rooms: RoomModel[] | null;
}