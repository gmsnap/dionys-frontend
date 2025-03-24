import { LocationModel } from "@/models/LocationModel";
import { PartnerUserModel } from "@/models/PartnerUserModel";

export const companyCompleted = (
    partnerUser: PartnerUserModel | null
): boolean => {
    if (!partnerUser || !partnerUser.company) {
        return false;
    }

    return (
        !!partnerUser.company.companyName &&
        !!partnerUser.company.address?.streetAddress &&
        !!partnerUser.company.address?.city &&
        !!partnerUser.company.address?.postalCode
    );
};

export const locationCompleted = (
    partnerLocations: LocationModel[] | null
): boolean => {
    return (
        Array.isArray(partnerLocations) &&
        partnerLocations.length > 0
    );
};

export const roomsCompleted = (
    partnerLocations: LocationModel[] | null
): boolean => {
    return Array.isArray(partnerLocations) && partnerLocations.some(
        (location) => location.rooms && location.rooms.length > 0
    );
};

export const onboardingCompleted = (
    partnerUser: PartnerUserModel | null,
    partnerLocations: LocationModel[] | null
): boolean => {
    return (
        companyCompleted(partnerUser) &&
        locationCompleted(partnerLocations) &&
        roomsCompleted(partnerLocations)
    );
};