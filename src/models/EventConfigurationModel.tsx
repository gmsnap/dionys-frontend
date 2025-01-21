import * as yup from 'yup';
import { EventCategories } from "@/constants/EventCategories";
import { RoomModel } from "./RoomModel";

export interface EventConfigurationModel {
    locationId: number;
    roomId: number | null;
    room: RoomModel | null;
    occasion: EventCategories | null;
    persons: number;
    date: number | null;
    roomConfigurationId: number | null;
    rooms: RoomModel[] | null;
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
    occasion: yup
        .mixed<EventCategories>()
        .nullable()
        .required('Event Type ist erforderlich'),
    persons: yup
        .number()
        .required('Anzahl der Personen ist erforderlich')
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
    roomConfigurationId: yup
        .number()
        .nullable(),
    rooms: yup
        .array()
        .of(yup.object())
        .nullable(),
});