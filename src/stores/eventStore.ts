import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocationModel } from '@/models/LocationModel';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';
import { EventConfigurationFilters } from '@/models/EventConfigurationFilters';

interface StoreState {
    location: LocationModel | null;
    eventConfiguration: EventConfigurationModel | null;
    eventConfigurationFilters: EventConfigurationFilters | null;
    setLocation: (location: LocationModel) => void;
    setEventConfiguration: (configuration: EventConfigurationModel | null) => void;
    setEventConfigurationFilters: (filters: EventConfigurationFilters | null) => void;
}

const useStore = create<StoreState>()(
    persist(
        (set) => ({
            location: null,
            eventConfiguration: null,
            eventConfigurationFilters: null,
            setLocation: (location) => set({ location }),
            setEventConfiguration: (configuration) => set({ eventConfiguration: configuration }),
            setEventConfigurationFilters: (filters) => set({ eventConfigurationFilters: filters }),
        }),
        {
            // unique name for local storage
            name: 'event-configuration',
        }
    )
);

export default useStore;

export const createDefaultEventConfigurationModel = (locationId: number): EventConfigurationModel => {
    const now = new Date();
    // tomorrow
    now.setDate(now.getDate() + 1);

    // Create a new Date object for endDate and add 2 hours
    const endDate = new Date(now.getTime());
    endDate.setHours(endDate.getHours() + 2);

    return {
        id: 0,
        locationId: locationId,
        roomId: null,
        room: null,
        packageIds: null,
        package: null,
        eventCategory: null,
        persons: 0,
        date: now.getTime(),
        endDate: endDate.getTime(),
        roomConfigurationId: null,
        bookerId: null,
        location: null,
        rooms: null,
        packages: null,
        booker: null,
        notes: null,
    };
};

export const createDefaultFilters = (): EventConfigurationFilters => {
    return {
        city: null,
        minPersons: null,
        maxPersons: null,
        budget: null,
        dateRange: { from: null, to: null },
    };
}
