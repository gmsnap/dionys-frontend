import React, { useEffect, useRef, useState } from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { EventCategories } from '@/constants/EventCategories';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import { Frown } from 'lucide-react';
import theme from '@/theme';
import { fetchEventCategoriesByCompany } from '@/services/eventCategoryService';
import { EventCategoryModel } from '@/models/EventCategoryModel';

interface CategorySelectorProps {
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

interface CategoryItemProps {
    name: string;
    image: string;
}

const CategorySelector = ({
    stepCompleted,
    sx
}: CategorySelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);
    const [eventCategories, setEventCategories] = useState<CategoryItemProps[] | null>(null);
    const [isNarrow, setIsNarrow] = useState(true); // To toggle layout based on width
    const containerRef = useRef<HTMLDivElement | null>(null); // Ref for parent container

    const handleSelectOccasion = (category: EventCategories): void => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                eventCategory: category,
            });
        }
        stepCompleted?.();
    };

    useEffect(() => {
        if (!eventCategories) {
            return;
        }
        setVisible(true);
    }, [eventCategories]);

    useEffect(() => {
        if (!location?.eventCategories) {
            return;
        }

        const setModels = async (companyId: number) => {
            const models =
                await fetchEventCategoriesByCompany(
                    companyId,
                    undefined,
                    undefined
                );
            if (models) {
                const cat = location.eventCategories.map((category) => ({
                    name: category as EventCategories,
                    image:
                        models.filter((m: EventCategoryModel) => {
                            return m.categoryKey == category as string
                        })?.[0]?.image
                        ?? `/category-${category}.jpg`
                }));
                setEventCategories(cat);
            }
        };

        if (location.companyId) {
            setModels(location.companyId);
            return;
        }
        const cat = location.eventCategories.map((category) => ({
            name: category as EventCategories,
            image: `/category-${category}.jpg`
        }));
        setEventCategories(cat);
    }, [location]);

    /*useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Toggle `isNarrow` based on the container's width
                setIsNarrow(entry.contentRect.width < 600); // Layout threshold
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);*/

    return (
        <Box
            ref={containerRef} // Attach ref to track width changes
            sx={{
                display: 'flex',
                flexDirection: isNarrow ? 'column' : 'row', // Layout adjusts based on observed width
                gap: 2,
                height: '100%',
                overflowY: isNarrow ? 'auto' : 'hidden',
                ...sx,
            }}
        >
            {eventCategories && eventCategories.length > 0 ? (
                eventCategories.map((category, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: isNarrow ? '0 0 auto' : 1,
                            minWidth: isNarrow ? '100%' : '20%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleSelectOccasion(category.name as EventCategories)}
                    >
                        {/* Category Image */}
                        <Box
                            component="img"
                            draggable={false}
                            src={category.image}
                            alt={category.name}
                            sx={{
                                width: '100%',
                                height: '250px',
                                objectFit: 'cover',
                                pointerEvents: 'none',
                            }}
                        />

                        {/* Darkening Overlay */}
                        <Box
                            className="overlay"
                            sx={{
                                backgroundColor: "#000000",
                                opacity: 0.5,
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                transition: "opacity 0.53s ease",
                                "&:hover": {
                                    opacity: 0.25,
                                },
                            }}
                        />

                        {/* Text Overlay */}
                        <Typography
                            variant="h6"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                opacity: 0.85,
                                fontWeight: 'normal',
                                color: 'white',
                                pointerEvents: "none",
                            }}
                        >
                            {formatEventCategoriesSync([category.name as EventCategories])}
                        </Typography>
                    </Box>
                ))
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h3" sx={{ mt: 8, mb: 2 }}>
                        Keine Event-Typen verfügbar
                    </Typography>
                    <Frown size={32} color={theme.palette.customColors.blue.main} />
                </Box>
            )}
        </Box>
    );
};

export default CategorySelector;
