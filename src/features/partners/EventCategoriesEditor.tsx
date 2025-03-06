import { AvailableEventCategories } from "@/constants/EventCategories";
import { formatEventCategoryStringSync } from "@/utils/formatEventCategories";
import { Box, Typography } from "@mui/material";
import SingleImageUploadForm from "./SingleImageUploadForm";
import { useEffect, useState } from "react";
import { createEmptyEventCategoryModel, EventCategoryModel } from "@/models/EventCategoryModel";
import { createEventCategory, deleteEventCategory, fetchEventCategoriesByCompany } from "@/services/eventCategoryService";
import { useAuthContext } from "@/auth/AuthContext";
import useStore from '@/stores/partnerStore';

const EventCategoriesEditor = () => {
    const { authUser } = useAuthContext();
    const { partnerUser } = useStore();
    const [categoryModels, setCategoryModels] = useState<EventCategoryModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setModels = async () => {
        if (partnerUser?.companyId) {
            const models =
                await fetchEventCategoriesByCompany(
                    partnerUser.companyId,
                    setIsLoading,
                    setError
                );
            if (models) {
                setCategoryModels(models);
                return;
            }
        }
        setCategoryModels([]);
    };

    const handleImageUpload = async (category: string, image: string) => {
        if (!authUser) {
            return;
        }
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }
        try {
            let model = categoryModels.filter((m) => m.categoryKey === category)[0];
            if (!model) {
                model = createEmptyEventCategoryModel(companyId, category);
            }
            model.image = image;
            await createEventCategory(
                model,
                () => {
                    // Success
                    setModels();
                },
                () => {
                    // Handle Error
                },
                authUser.idToken);
        } catch (error) {
            console.error("Image upload failed", error);
        }
    };

    const handleImageDelete = async (category: string) => {
        if (!authUser) {
            return;
        }
        const companyId = partnerUser?.companyId;
        if (!companyId) {
            return;
        }
        try {
            const model = categoryModels.filter((m) => m.categoryKey === category)[0];
            if (!model?.id) {
                return;
            }
            await deleteEventCategory(
                model.id,
                () => {
                    // Success
                    setModels();
                },
                () => {
                    // Handle Error
                },
                authUser.idToken);
        } catch (error) {
            console.error("Image upload failed", error);
        }
    };

    useEffect(() => {
        setModels();
    }, [partnerUser]);

    return (
        <Box>
            {AvailableEventCategories.map((cat: string) => {
                const categoryModel = categoryModels.find(c => c.categoryKey === cat);
                return (
                    <Box key={cat}>
                        <Typography>{formatEventCategoryStringSync(cat)}</Typography>
                        <SingleImageUploadForm
                            image={categoryModel?.image ?? undefined}
                            defaultImage={`/category-${cat}.jpg`}
                            onImageUpload={(url: string) => handleImageUpload(cat, url)}
                            onImageDelete={() => handleImageDelete(cat)}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

export default EventCategoriesEditor;
