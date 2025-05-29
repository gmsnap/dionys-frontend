import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid2, SxProps, Theme, Typography } from '@mui/material';
import useStore from '@/stores/eventStore';
import { EventCategories } from '@/constants/EventCategories';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';
import { Frown } from 'lucide-react';
import theme from '@/theme';
import { fetchEventCategoriesByCompany, fetchEventCategoriesByLocation } from '@/services/eventCategoryService';
import { EventCategoryModel } from '@/models/EventCategoryModel';

interface CategorySelectorProps {
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

interface CategoryItemProps {
    name: string;
    image: string;
}

const CategorySelector = ({ stepCompleted, sx }: CategorySelectorProps) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);
    const [eventCategories, setEventCategories] = useState<CategoryItemProps[] | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const handleSelectOccasion = (category: EventCategories): void => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                eventCategory: category,
            });
        }
        stepCompleted?.();
    };

    // Determine grid column size based on container width
    const getGridSize = () => {
        if (containerWidth < 600) return 6 // Full width on small screens
        if (containerWidth < 960) return 6 // 2 columns on medium screens
        return 6 // 3 columns on large screens
    };

    const getAspectRatio = () => {
        return (0.5 * containerWidth) / containerHeight
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

        const setModels = async (locationId: number) => {
            const models =
                await fetchEventCategoriesByLocation(
                    locationId,
                    undefined,
                    undefined);
            if (models) {
                const cat = location.eventCategories.map((category) => {
                    const model = models.find((m: EventCategoryModel) =>
                        m.categoryKey === (category as string)
                    );

                    return {
                        name: category as EventCategories,
                        image: model?.effectiveImage ?? model?.image ?? `/category-${category}.jpg`,
                    };
                });
                setEventCategories(cat);
            }
        }

        if (location.id) {
            setModels(location.id);
            return;
        }
        const cat = location.eventCategories.map((category) => ({
            name: category as EventCategories,
            image: `/category-${category}.jpg`,
        }))
        setEventCategories(cat);
    }, [location]);

    // Track container width for responsive adjustments
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
                setContainerHeight(entry.contentRect.height);
            }
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            // Set initial width
            setContainerWidth(containerRef.current.offsetWidth);
            setContainerHeight(containerRef.current.offsetHeight);
        }

        return () => {
            resizeObserver.disconnect();
        }
    }, []);

    return (
        <Box
            ref={containerRef}
            sx={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                ...sx,
            }}
        >
            {eventCategories && eventCategories.length > 0 ? (
                <Grid2 container spacing={2}>
                    {eventCategories.map((category, index) => (
                        <Grid2 size={{ xs: 12, sm: 6, md: getGridSize() }} key={index}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    aspectRatio: { xs: 16 / 9, sm: getAspectRatio() },
                                    width: '100%',
                                    '&:hover .overlay': {
                                        opacity: 0.25,
                                    },
                                }}
                                onClick={() => handleSelectOccasion(category.name as EventCategories)}
                            >
                                {/* Category Image */}
                                <Box
                                    component='img'
                                    draggable={false}
                                    src={category.image}
                                    alt={category.name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        pointerEvents: 'none',
                                        borderRadius: '4px',
                                    }}
                                />

                                {/* Darkening Overlay */}
                                <Box
                                    className='overlay'
                                    sx={{
                                        backgroundColor: '#000000',
                                        opacity: 0.5,
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        transition: 'opacity 0.53s ease',
                                        borderRadius: '4px',
                                    }}
                                />

                                {/* Text Overlay */}
                                <Typography
                                    variant='h6'
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        opacity: 0.85,
                                        fontWeight: 'normal',
                                        color: 'white',
                                        pointerEvents: 'none',
                                        textAlign: 'center',
                                        width: '90%',
                                    }}
                                >
                                    {formatEventCategoriesSync([category.name as EventCategories])}
                                </Typography>
                            </Box>
                        </Grid2>
                    ))}
                </Grid2>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant='h3' sx={{ mt: 8, mb: 2 }}>
                        Keine Event-Typen verfügbar
                    </Typography>
                    <Frown size={32} color={theme.palette.customColors.blue.main} />
                </Box>
            )}
        </Box>
    )
}

export default CategorySelector
