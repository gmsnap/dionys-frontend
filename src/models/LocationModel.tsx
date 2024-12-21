import { EventCategories } from "@/constants/EventCategories";
import { RoomModel } from "./RoomModel";

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
    rooms: RoomModel[] | null;
}

export const createEmptyLocationModel = (partnerId: number): LocationModel => ({
    id: 0,
    partnerId: partnerId,
    title: '',
    city: '',
    area: '',
    streetAddress: '',
    postalCode: '',
    geoLocation: {
        lat: 0,
        lng: 0,
    },
    image: 'https://d18yz6yiwm54x7.cloudfront.net/media/images/46696f05-6bd7-4826-bf32-64b4937a5d54.jpg',
    price: 0,
    eventCategories: [],
    rooms: [],
});