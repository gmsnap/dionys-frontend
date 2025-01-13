import { PartnerCompanyModel } from "./PartnerCompanyModel";

export interface PartnerUserModel {
    id: number;
    companyId: number;
    cognitoSub: string;
    email: string;
    givenName: string;
    familyName: string;
    createdAt: Date;
    updatedAt: Date;
    company: PartnerCompanyModel | null;
}