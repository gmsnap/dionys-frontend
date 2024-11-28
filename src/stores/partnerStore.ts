import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartnerUserModel } from '@/models/PartnerUserModel';
import { LocationModel } from '@/models/LocationModel';

interface StoreState {
    partnerUser: PartnerUserModel | null;
    partnerLocation: LocationModel | null;
    setPartnerUser: (partnerUser: PartnerUserModel | null) => void;
    setPartnerLocation: (partnerLocation: LocationModel | null) => void;
}

const useStore = create<StoreState>()(
    persist(
        (set) => ({
            partnerUser: null,
            partnerLocation: null,
            setPartnerUser: (partnerUser) => set({ partnerUser }),
            setPartnerLocation: (partnerLocation) => set({ partnerLocation }),
        }),
        {
            // unique name for local storage
            name: 'partner',
        }
    )
);

export default useStore;
