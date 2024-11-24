import City from "./City";

export interface EventConfigurationFilters {
    city: City | null, // e.g., { label: 'Berlin', value: 'berlin' }
    minPersons: number | null,
    maxPersons: number | null,
    budget: number | null,
    dateRange: { from: null, to: null },
}