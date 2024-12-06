import { EventCategories } from "@/constants/EventCategories";
import { VenueModel } from "./VenueModel";
import { RoomModel } from "./RoomModel";

export interface EventConfigurationModel {
    locationId: number;
    venueId: number;
    venue: VenueModel | null;
    occasion: EventCategories | null;
    persons: number;
    roomConfigurationId: number;
    rooms: RoomModel[] | null;
}