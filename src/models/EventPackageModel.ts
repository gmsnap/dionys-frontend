import * as yup from 'yup';
import { PackageCategories } from "@/constants/PackageCategories";
import { BookingPackage, PriceTypes, PricingLabels } from '@/utils/pricingManager';
import { AvailableEventCategories } from '@/constants/EventCategories';

export interface EventPackageModel {
    id: number;
    locationId: number;
    title: string;
    description: string;
    proposalDescription?: string;
    useProposalDescription: boolean;
    packageCategory: PackageCategories;
    price: number;
    priceType: PriceTypes;
    pricingLabel: PricingLabels;
    minPersons: number | null;
    maxPersons: number | null;
    images: string[];
    eventCategories: string[];
    maxQuantity: number | null;
    roomIds?: number[];
}

export const createEmptyEventPackageModel = (
    locationId: number,
    category: PackageCategories
): EventPackageModel => ({
    id: 0,
    locationId: locationId,
    title: '',
    description: '',
    useProposalDescription: false,
    packageCategory: category,
    price: 0,
    priceType: 'person',
    pricingLabel: 'exact',
    minPersons: null,
    maxPersons: null,
    images: [],
    eventCategories: [...AvailableEventCategories],
    maxQuantity: null,
    roomIds: [],
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
    proposalDescription: yup
        .string()
        .nullable()
        .optional()
        .max(500, 'Angebotstext darf maximal 500 Zeichen lang sein'),
    useProposalDescription: yup
        .boolean()
        .default(false),
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
    maxQuantity: yup
        .number()
        .nullable(),
    roomIds: yup.array()
        .of(yup.number())
        .optional(),
});

export const toBookingPackage = (
    model: EventPackageModel,
    quantity: number
): BookingPackage => ({
    id: model.id,
    name: model.title,
    packageCategory: model.packageCategory,
    price: model.price,
    priceType: model.priceType as string,
    minPersons: model.minPersons ?? 1,
    maxPersons: model.maxPersons ?? Infinity,
    quantity: quantity,
});