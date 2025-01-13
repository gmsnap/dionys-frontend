import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartnerUserModel } from '@/models/PartnerUserModel';
import { LocationModel } from '@/models/LocationModel';

interface StoreState {
    partnerUser: PartnerUserModel | null;
    partnerLocations: LocationModel[] | null;
    setPartnerUser: (partnerUser: PartnerUserModel | null) => void;
    setPartnerLocations: (partnerLocations: LocationModel[] | null) => void;
}

const useStore = create<StoreState>()(
    persist(
        (set) => ({
            partnerUser: null,
            partnerLocations: null,
            setPartnerUser: (partnerUser) => set({ partnerUser }),
            setPartnerLocations: (partnerLocations) => set({ partnerLocations }),
        }),
        {
            // unique name for local storage
            name: 'partner',
        }
    )
);

export default useStore;
