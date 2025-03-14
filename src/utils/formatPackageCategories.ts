import { PackageCategories } from "@/constants/PackageCategories";

const staticTranslations = {
    "catering": "Food & Beverage",
    "equipment": "Look & Feel",
};

export const formatPackageCategory = (category: PackageCategories): string => {
    return staticTranslations[category] ?? "-";
};
