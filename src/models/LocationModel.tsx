export interface GeoLocation {
    type: "Point"; // Fixed value as the API specifies "Point"
    coordinates: [number, number]; // Tuple for longitude and latitude
}

export interface LocationModel {
    id: number;
    title: string;
    city: string;
    area: string;
    streetAddress: string;
    postalCode: string;
    geoLocation: GeoLocation;
    image: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}