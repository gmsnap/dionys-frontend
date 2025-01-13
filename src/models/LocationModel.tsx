import { EventCategories } from "@/constants/EventCategories";
import { RoomModel } from "./RoomModel";

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface LocationModel {
    id: number;
    companyId: number;
    title: string;
    city: string;
    area: string;
    streetAddress: string;
    postalCode: string;
    geoLocation: GeoLocation;
    image: string | File | null;
    price: number;
    eventCategories: EventCategories[];
    rooms: RoomModel[] | null;
}

export const createEmptyLocationModel = (companyId: number): LocationModel => ({
    id: 0,
    companyId,
    title: '',
    city: '',
    area: '',
    streetAddress: '',
    postalCode: '',
    geoLocation: {
        lat: 0,
        lng: 0,
    },
    image: null,
    price: 0,
    eventCategories: [],
    rooms: [],
});