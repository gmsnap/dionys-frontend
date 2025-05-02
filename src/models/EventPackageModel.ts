import * as yup from 'yup';
import { PackageCategories } from "@/constants/PackageCategories";
import { PriceTypes } from '@/constants/PriceTypes';
import { BookingPackage } from '@/utils/pricingManager';

export interface EventPackageModel {
    id: number;
    locationId: number;
    title: string;
    description: string;
    packageCategory: PackageCategories;
    price: number;
    priceType: PriceTypes;
    minPersons: number | null;
    maxPersons: number | null;
    images: string[];
    eventCategories: string[];
}

export const createEmptyEventPackageModel = (
    locationId: number,
    category: PackageCategories
): EventPackageModel => ({
    id: 0,
    locationId: locationId,
    title: '',
    description: '',
    packageCategory: category,
    price: 0,
    priceType: 'person',
    minPersons: null,
    maxPersons: null,
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
        .typeError('Preis muss eine Zahl sein')
        .min(0, 'Preis darf nicht negativ sein')
        .nullable()
        .transform(value => (value === null || value === '') ? undefined : value)
        .required('Preis ist erforderlich'),
    priceType: yup
        .string()
        .required('Preis-Type ist erforderlich')
        .min(1, 'Preis-Type muss ein gültiger Wert sein'),
    minPersons: yup
        .number()
        .nullable()
        .typeError("Mindestpersonenanzahl muss eine Zahl sein")
        .positive("Mindestpersonenanzahl muss positiv sein")
        .test(
            "min-max-persons",
            "Mindestpersonenanzahl muss kleiner oder gleich Maximalpersonenanzahl sein",
            function (this: yup.TestContext<yup.AnyObject>, value: number | null | undefined) {
                const maxPersons = this.parent.maxPersons as number | null | undefined
                if (value === null || value === undefined || maxPersons === null || maxPersons === undefined) return true
                return value <= maxPersons
            },
        ),
    maxPersons: yup
        .number()
        .nullable()
        .typeError("Maximalpersonenanzahl muss eine Zahl sein")
        .positive("Maximalpersonenanzahl muss positiv sein")
        .test(
            "max-min-persons",
            "Maximalpersonenanzahl muss größer oder gleich Mindestpersonenanzahl sein",
            function (this: yup.TestContext<yup.AnyObject>, value: number | null | undefined) {
                const minPersons = this.parent.minPersons as number | null | undefined
                if (value === null || value === undefined || minPersons === null || minPersons === undefined) return true
                return value >= minPersons
            },
        ),
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

export const toBookingPackage = (model: EventPackageModel): BookingPackage => ({
    id: model.id,
    price: model.price,
    priceType: model.priceType as string,
    minPersons: model.minPersons ?? 1,
    maxPersons: model.maxPersons ?? Infinity,
});