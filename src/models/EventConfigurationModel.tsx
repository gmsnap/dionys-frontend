import { EventCategories } from "@/constants/EventCategories";

export interface EventConfigurationModel {
    locationId: number;
    venueId: number;
    occasion: EventCategories[];
    persons: number
}