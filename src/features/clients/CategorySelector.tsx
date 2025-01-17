import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import useStore from '@/stores/eventStore';
import { AvailableEventCategories, EventCategories } from '@/constants/EventCategories';
import router from 'next/router';
import { formatEventCategoriesSync } from '@/utils/formatEventCategories';

interface CategorySelectorProps {
    stepCompleted: () => void,
    sx?: SxProps<Theme>;
}

const eventCategories: { name: EventCategories; image: string }[] =
    AvailableEventCategories.map((category) => ({
        name: category as EventCategories,
        image: `/category-${category}.jpg`
    }));

const CategorySelector = ({ stepCompleted, sx }: CategorySelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);

    const handleSelectOccasion = (category: EventCategories): void => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                occasion: category,
            });
        }

        stepCompleted?.();
    };

    useEffect(() => {
        setVisible(true); // Trigger fade-in by setting opacity to 1
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' }, // Vertical on small, horizontal on larger screens
                gap: 2, // Spacing between items
                height: '100%',
                overflowY: { xs: 'auto', sm: 'hidden' }, // Enable scrolling for vertical layout
                ...sx,
            }}
        >
            {eventCategories.map((category, index) => (
                <Box
                    key={index}
                    sx={{
                        flex: { xs: '0 0 auto', sm: 1 }, // Allow scrollable on small screens; evenly distribute on large screens
                        minWidth: { xs: '100%', sm: '20%' }, // Full width for small screens; flexible for larger
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                    }}
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
                            borderRadius: '8px',
                            pointerEvents: 'none',
                        }}
                    />
                    {/* Text Overlay */}
                    <Box
                        onClick={() => handleSelectOccasion(category.name)}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            padding: '16px 32px',
                            borderRadius: '4px',
                            textAlign: 'center',
                        }}
                    >
                        {formatEventCategoriesSync([category.name as EventCategories])}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default CategorySelector;
