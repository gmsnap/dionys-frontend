import { LocationModel } from "./LocationModel";

export interface PartnerCompanyModel {
    id: number;
    companyName: string | null;
    companyRegistrationNumber: string | null;
    companyTaxId: string | null;
    contactEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
    locations: LocationModel[] | null;
}