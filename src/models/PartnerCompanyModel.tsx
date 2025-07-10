import { AddressModel } from "./AddressModel";
import { LocationModel } from "./LocationModel";
import { SubscriptionModel } from "./SubscriptionModel";

export interface PartnerCompanyModel {
    id: number;
    companyName: string | null;
    companyRegistrationNumber: string | null;
    companyTaxId: string | null;
    contactEmail: string | null;
    phoneNumber: string | null;
    addressId: number | null;
    billingAddressId: number | null;
    createdAt: Date;
    updatedAt: Date;
    address: AddressModel | null;
    billingAddress: AddressModel | null;
    billingDetails: string[];
    locations: LocationModel[] | null;
    subscription: SubscriptionModel | null | undefined;
}