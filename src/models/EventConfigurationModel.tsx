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
        .required('Datum ist erforderlich'),
    roomConfigurationId: yup
        .number()
        .nullable(),
    rooms: yup
        .array()
        .of(yup.object())
        .nullable(),
});