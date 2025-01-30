import * as yup from 'yup';
import { AvailablePackageCategories } from "@/constants/PackageCategories";

export interface EventPackageModel {
    id: number;
    locationId: number;
    title: string;
    description: string;
    packageCategory: string;
    price: number;
    priceType: string;
    minPersons: number;
    maxPersons: number;
    images: string[];
    eventCategories: string[];
}

export const createEmptyEventPackageModel = (locationId: number): EventPackageModel => ({
    id: 0,
    locationId: locationId,
    title: '',
    description: '',
    packageCategory: AvailablePackageCategories[0],
    price: 0,
    priceType: 'person',
    minPersons: 0,
    maxPersons: 0,
    images: [],
    eventCategories: [],
});

// Validation schema
export const EventPackageValidationSchema = yup.object().shape({
    locationId: yup
        .number()
        .required('Location ist erforderlich')
        .positive('Wählen Sie eine gültige Location aus'),
    title: yup
        .string()
        .required('Bezeichnung ist erforderlich')
        .min(1, 'Bezeichnung muss mindestens 1 Zeichen lang sein'),
    description: yup
        .string(),
    packageCategory: yup
        .string()
        .required('Paketkategorie ist erforderlich')
        .min(1, 'Paketkategorie muss ein gültiger Wert sein'),
    price: yup
        .number()
        .typeError('Preis / Tag muss eine Zahl sein')
        .positive('Preis / Tag muss positiv sein')
        .required('Preis / Tag ist erforderlich'),
    priceType: yup
        .string()
        .required('Preis-Type ist erforderlich')
        .min(1, 'Preis-Type muss ein gültiger Wert sein'),
    minPersons: yup
        .number()
        .typeError('Mindestpersonenanzahl muss eine Zahl sein')
        .positive('Mindestpersonenanzahl muss positiv sein')
        .max(yup.ref('maxPersons'), 'Mindestpersonenanzahl muss kleiner als Maximalpersonenanzahl sein')
        .required('Mindestpersonenanzahl ist erforderlich'),
    maxPersons: yup
        .number()
        .typeError('Maximalpersonenanzahl muss eine Zahl sein')
        .positive('Maximalpersonenanzahl muss positiv sein')
        .min(yup.ref('minPersons'), 'Maximalpersonenanzahl muss größer als Mindestpersonenanzahl sein')
        .required('Maximalpersonenanzahl ist erforderlich'),
    images: yup.array().of(yup.string()),
    eventCategories: yup
        .array()
        .nullable()
        .of(yup.string())
        .test(
            'eventCategories-not-empty',
            'Mindestens eine Kategorie notwendig',
            (value) => value != null && value.length > 0
        ),
});