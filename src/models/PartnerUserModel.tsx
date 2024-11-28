import { LocationModel } from "./LocationModel";

export interface PartnerUserModel {
    id: number;
    cognitoSub: string;
    email: string;
    givenName: string;
    familyName: string;
    company: string;
    companyRegistrationNumber: string;
    companyTaxId: string;
    createdAt: Date;
    updatedAt: Date;
    locations: LocationModel[] | null;
}