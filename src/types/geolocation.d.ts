// GeoLocation type
export type GeoLocation = {
    lat: number;
    lng: number;
};

// CreateLocationResponse type
export type CreateLocationResponse = {
    message: string; // Response message (e.g., success or error message)
    location: {
        id: number; // Location ID (auto-generated by the backend)
        title: string;
        city: string;
        area: string | null; // Nullable area
        streetAddress: string;
        postalCode: string;
        geoLocation?: GeoLocation; // Optional GeoLocation
        image: string; // Image URL or file name
        price: number;
        createdAt: string; // ISO string for created timestamp
        updatedAt: string; // ISO string for updated timestamp
    };
    uploadUrl?: string; // Optional presigned URL for file upload
    imageUrl: string; // Final image URL
};
