import { PackageCategories } from "@/constants/PackageCategories";

const staticTranslations = {
    "catering": "Catering",
    "equipment": "Equipment",
};

export const formatPackageCategory = (category: PackageCategories): string => {
    return staticTranslations[category] ?? "-";
};
