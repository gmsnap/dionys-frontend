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
    return {
        locationId: locationId,
        roomId: 0,
        room: null,
        occasion: null,
        persons: 50,
        roomConfigurationId: 0,
        rooms: null
    };
}

export const createDefaultFilters = (): EventConfigurationFilters => {
    return {
        city: null,
        minPersons: null,
        maxPersons: null,
        budget: null,
        dateRange: { from: null, to: null },
    };
}
