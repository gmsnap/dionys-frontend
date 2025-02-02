import * as yup from 'yup';

export interface BookingCompanyModel {
    id: number;
    companyName: string;
    contactName: string;
    streetAddress: string;
    city: string;
}

export const createEmptyBookingCompanyModel = (): BookingCompanyModel => ({
    id: 0,
    companyName: '',
    contactName: '',
    streetAddress: '',
    city: '',
});

// Validation schema
export const BookingCompanyModelValidationSchema = yup.object().shape({
    companyName: yup
        .string()
        .required('Unternehmensname ist erforderlich')
        .min(1, 'Unternehmensname muss mindestens 1 Zeichen lang sein'),

    contactName: yup
        .string()
        .required('Kontakt-Person ist erforderlich')
        .min(1, 'Kontakt-Person muss mindestens 1 Zeichen lang sein'),

    streetAddress: yup
        .string()
        .required('Rechnungsanschrift ist erforderlich')
        .min(1, 'Rechnungsanschrift muss mindestens 1 Zeichen lang sein'),

    city: yup
        .string()
        .required('PLZ und Stadt sind erforderlich')
        .min(1, 'PLZ und Stadt dürfen nicht leer sein'),
});