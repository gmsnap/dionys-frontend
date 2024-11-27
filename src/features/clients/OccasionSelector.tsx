import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import useStore from '@/stores/eventStore';
import { AvailableEventCategories, EventCategories } from '@/constants/EventCategories';
import router from 'next/router';

interface OccasionSelectorProps {
    sx?: SxProps<Theme>;
}

const eventCategories: { name: EventCategories; image: string }[] =
    AvailableEventCategories.map((category) => ({
        name: category as EventCategories,
        image: `/category-${category}.jpg`
    }));

/*const eventCategories: { name: EventCategories; image: string }[] = [
    { name: "lunch", image: "/category-lunch.jpg" },
    { name: "business", image: "/category-business.jpg" },
    { name: "meeting", image: "/category-meeting.jpg" },
    { name: "conference", image: "/category-conference.jpg" },
];*/

const OccasionSelector = ({ sx }: OccasionSelectorProps) => {
    const { eventConfiguration, setEventConfiguration } = useStore();
    const [visible, setVisible] = useState(false);

    const handleSelectOccasion = (category: EventCategories): void => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                occasion: category,
            });

            router.push(eventConfiguration.locationId ?
                `/configurator/${eventConfiguration.locationId}` :
                `/locations`);

            return;
        }
        router.push(`/locations`);
    }

    useEffect(() => {
        setVisible(true); // Trigger fade-in by setting opacity to 1
    }, []);

    return (
        <Box
            display={'flex'}
            flexDirection={'row'}
            sx={{
                height: '100%', // Ensure the parent box has a defined height
                ...sx,
            }}
        >
            {eventCategories.map((category, index) => (
                <Box
                    key={index}
                    flex={1} // Evenly distribute child boxes
                    display="flex" // Required to make content fill height
                    flexDirection="column" // Stack image and text vertically
                    sx={{
                        height: '100%', // Full height of the parent
                        position: 'relative', // Enable positioning for overlay
                        overflow: 'hidden', // Ensure no content overflows the box
                    }}
                >
                    <Box
                        component="img"
                        sx={{
                            width: '100%', // Full width of its container
                            height: '100%', // Full height of its container
                            objectFit: 'cover', // Crop the image to fit its box
                        }}
                        src={category.image}
                        alt={`image ${category.name}`}
                    />
                    {/* Image Overlay */}
                    <Box
                        sx={{
                            position: 'absolute', // Overlay on the image
                            top: 0, // Place at the top of the image
                            left: 0, // Align to the left
                            width: '100%', // Match the image width
                            height: '100%', // Match the image height
                            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Optional: Add a semi-transparent background
                            opacity: visible ? 1 : 0, // Opacity transitions from 0 to 1
                            transition: 'opacity 0.75s ease-out', // Smooth fade-in transition
                            transitionDelay: `${0.25 * index}s`, // Delay the transition by 1 second
                        }}
                    />
                    {/* Text Overlay */}
                    <Box
                        sx={{
                            position: 'absolute', // Overlay on the image
                            bottom: 150, // Place at the top of the image
                            left: 35, // Align to the left
                            color: 'white', // Make the text stand out
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '24px', // Adjust text size as needed
                            fontWeight: 700,
                            letterSpacing: '-0.05em',
                            textTransform: 'uppercase',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleSelectOccasion(category.name)}
                    >
                        <Box sx={{ paddingBottom: '16px' }}>
                            {category.name}
                        </Box>
                        <Box
                            component="img"
                            src={'/arrow-right.png'}
                            alt={'category-lunch'}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default OccasionSelector;