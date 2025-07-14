import * as yup from 'yup';

export interface BillingDetails {
    logo?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
    accountNumber?: string;
    bankCode?: string;
    invoiceHeader?: string;
    invoiceFooter?: string;
    legalLink?: string;
    contactPerson?: string;
}

export const createEmptyBillingDetails = (): BillingDetails => ({
    logo: "",
    accountNumber: "",
    iban: "",
    bic: "",
    bankName: "",
    bankCode: "",
    invoiceHeader: "",
    invoiceFooter: "",
    legalLink: "",
    contactPerson: "",
});

// Validation schema
export const billingDetailsValidationSchema = yup.object().shape({
    legalLink: yup
        .string()
        .url('Bitte eine gültige URL eingeben'),
});