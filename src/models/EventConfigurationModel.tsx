import { EventCategories } from "@/constants/EventCategories";

export interface EventConfigurationModel {
    locationId: number;
    venueId: number;
    venue: VenueModel | null;
    occasion: EventCategories[];
    persons: number;
    roomConfigurationId: number;
    rooms: RoomModel[] | null;
}