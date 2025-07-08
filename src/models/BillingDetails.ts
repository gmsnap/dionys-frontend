export interface BillingDetails {
    logo?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
    accountNumber?: string;
    bankCode?: string;
    invoiceHeader?: string;
    invoiceFooter?: string;
}

export const createEmptyBillingDetails = (): BillingDetails => ({
    logo: "",
    accountNumber: "",
    iban: "",
    bic: "",
    bankName: "",
    bankCode: "",
    invoiceHeader: "",
    invoiceFooter: ""
});