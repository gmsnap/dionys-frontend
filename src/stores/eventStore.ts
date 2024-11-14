import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocationModel } from '@/models/LocationModel';
import { EventConfigurationModel } from '@/models/EventConfigurationModel';

interface StoreState {
    location: LocationModel | null;
    eventConfiguration: EventConfigurationModel | null;
    setLocation: (location: LocationModel) => void;
    setEventConfiguration: (configuration: EventConfigurationModel) => void;
}

const useStore = create<StoreState>()(
    persist(
        (set) => ({
            location: null,
            eventConfiguration: null,
            setLocation: (location) => set({ location }),
            setEventConfiguration: (configuration) => set({ eventConfiguration: configuration }),
        }),
        {
            // unique name for local storage
            name: 'event-configuration',
        }
    )
);

export default useStore;
