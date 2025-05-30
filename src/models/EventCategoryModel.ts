export interface EventCategoryModel {
    id: number;
    companyId: number;
    categoryKey: string;
    categoryName: string;
    image: string | null;
    effectiveImage?: string;
}

export const createEmptyEventCategoryModel = (companyId: number, categoryKey: string): EventCategoryModel => ({
    id: 0,
    companyId: companyId,
    categoryKey: categoryKey,
    categoryName: categoryKey,
    image: null,
});