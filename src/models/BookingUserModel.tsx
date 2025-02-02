import * as yup from 'yup';
import { BookingCompanyModel } from './BookingCompanyModel';

export interface BookingUserModel {
    id: number;
    companyId: number | null;
    email: string;
    givenName: string;
    familyName: string;
    phoneNumber: string;
    bookingCompany: BookingCompanyModel | null;
}

export const createEmptyBookingUserModel = (): BookingUserModel => ({
    id: 0,
    companyId: null,
    email: '',
    givenName: '',
    familyName: '',
    phoneNumber: '',
    bookingCompany: null,
});

// Validation schema
export const BookingUserValidationSchema = yup.object().shape({
    companyId: yup.number().nullable(),

    email: yup
        .string()
        .email('Bitte eine gültige E-Mail-Adresse eingeben')
        .required('E-Mail ist erforderlich'),

    givenName: yup
        .string()
        .required('Vorname ist erforderlich')
        .min(1, 'Vorname muss mindestens 1 Zeichen lang sein'),

    familyName: yup
        .string()
        .required('Nachname ist erforderlich')
        .min(1, 'Nachname muss mindestens 1 Zeichen lang sein'),

    phoneNumber: yup
        .string()
        .matches(
            /^[+\d]?[0-9\s\-()]{6,}$/,
            'Bitte eine gültige Telefonnummer eingeben'
        )
        .required('Telefonnummer ist erforderlich'),
});