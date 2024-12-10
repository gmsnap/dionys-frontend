import { EventCategories } from "@/constants/EventCategories";

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface LocationModel {
    id: number;
    partnerId: number;
    title: string;
    city: string;
    area: string;
    streetAddress: string;
    postalCode: string;
    geoLocation: GeoLocation;
    image: string | File | null;
    price: number;
    eventCategories: EventCategories[];
}

export const createEmptyLocationModel = (): LocationModel => ({
    id: 0,
    partnerId: 0,
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
});