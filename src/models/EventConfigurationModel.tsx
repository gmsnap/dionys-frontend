import * as yup from 'yup';
import { EventCategories } from "@/constants/EventCategories";
import { RoomModel } from "./RoomModel";
import { EventPackageModel, toBookingPackage } from './EventPackageModel';
import { BookingUserModel } from './BookingUserModel';
import { LocationModel } from './LocationModel';
import { Booking } from '@/utils/pricingManager';

export interface EventConfigurationModel {
    id: number;
    locationId: number;
    roomIds: number[] | null;
    packageIds: number[] | null;
    eventCategory: EventCategories | null;
    persons: number | null;
    date: number | null;
    endDate: number | null;
    duration: number | null;
    roomConfigurationId: number | null;
    bookerId: number | null;
    location: LocationModel | null;
    rooms: RoomModel[] | null;
    packages: EventPackageModel[] | null;
    booker: BookingUserModel | null;
    notes: string | null;
}

export const EventConfValidationSchema = yup.object().shape({
    locationId: yup
        .number()
        .required('Location ist erforderlich')
        .positive('Wählen Sie eine gültige Location aus'),
    roomId: yup
        .number()
        .nullable(),
    room: yup
        .object()
        .nullable(),
    eventCategory: yup
        .mixed<EventCategories>()
        .nullable()
        .required('Event Type ist erforderlich'),
    persons: yup
        .number()
        .required('Teilnehmerzahl ist erforderlich')
        .positive('Wählen Sie eine gültige Anzahl an Personen'),
    date: yup
        .number()
        .nullable()
        .required('Datum ist erforderlich')
        .typeError('Das Datum muss ein gültiger Zeitstempel sein')
        .test(
            'is-future-date',
            'Das Datum muss in der Zukunft liegen',
            (value) => {
                if (value == null) return true;
                const today = new Date().setHours(0, 0, 0, 0);
                const inputDate = new Date(value).setHours(0, 0, 0, 0);
                return inputDate > today;
            }
        ),
    duration: yup
        .number()
        .required('Dauer ist erforderlich')
        .positive('Die Dauer muss positiv sein'),
    roomConfigurationId: yup
        .number()
        .nullable(),
    rooms: yup
        .array()
        .of(yup.object())
        .nullable(),
    packages: yup
        .array()
        .of(yup.object())
        .nullable(),
});

export const toBooking = (model: EventConfigurationModel): Booking | null => {
    if (!model.date || !model.endDate) {
        return null;
    }
    return {
        id: model.id,
        persons: model.persons ?? 1,
        date: model.date!!,
        endDate: model.endDate!!,
        packages: model.packages ? model.packages.map(toBookingPackage) : undefined,
        rooms: model.rooms ?? undefined,
    };
}