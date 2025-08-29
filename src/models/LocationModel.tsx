import { EventCategories } from "@/constants/EventCategories";
import { RoomModel } from "./RoomModel";
import { AddressModel } from "./AddressModel";
import { EventPackageModel } from "./EventPackageModel";

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
    price: number | null;
    billingAddressId: number | null;
    url: string | null;
    eventCategories: EventCategories[];
    rooms: RoomModel[] | null;
    billingAddress: AddressModel | null;
    eventPackages: EventPackageModel[] | null;
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
    billingAddressId: null,
    url: null,
    eventCategories: [],
    rooms: [],
    billingAddress: null,
    eventPackages: null,
});