import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ImageSlideshow from '@/features/clients/ImageSlideShow';

interface InfoItem {
    icon: React.ReactNode;
    label: string;
}

interface GridItemProps {
    id: number;
    images: string[];
    isSelected?: boolean;
    selectRequested?: (id: number) => void;
    title: string;
    subTitle: string;
    information?: string;
    infoItems?: InfoItem[];
}

const GridItem: React.FC<GridItemProps> = ({
    id,
    images,
    isSelected,
    selectRequested,
    title,
    subTitle,
    information,
    infoItems,
}) => {
    const [showInformation, setShowInformation] = useState(false);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                position: 'relative', // Ensure image container maintains layout
            }}
        >
            {/* Container for the image and overlay */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '250px',
                }}
            >
                {/* Image */}
                <ImageSlideshow
                    images={images}
                    sx={{ height: '250px', }}
                />

                {/* Title overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "'Nunito', sans-serif",
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            mt: 2,
                            opacity: 0.75,
                        }}
                    >
                        {title}
                        <br />
                        {subTitle.split("|").map((part, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <br />}
                                {part.trim()}
                            </React.Fragment>
                        ))}
                    </Typography>
                </Box>

                {/* Buttons overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        display: 'flex',
                        gap: 2,
                        zIndex: 11,
                    }}
                > {information &&
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ padding: '8px 16px' }}
                        onClick={() => setShowInformation(!showInformation)}
                    >
                        Informationen
                    </Button>}
                    <Button
                        variant="contained"
                        color={isSelected ? "secondary" : "primary"}
                        sx={{
                            padding: '8px 16px',
                            backgroundColor: isSelected ? '#FFFFFF' : undefined, // White background if selected
                            color: isSelected ? '#000000' : undefined, // Black text if selected
                            '&:hover': {
                                backgroundColor: isSelected ? '#F5F5F5' : undefined, // Light gray on hover when selected
                            },
                            borderRadius: 1,
                        }}
                        onClick={() => selectRequested?.(id)}
                    >
                        {isSelected ? 'Ausgewählt' : 'Wählen'}
                    </Button>
                </Box>
            </Box>

            {/* Description section (if needed outside the image) */}
            {showInformation && <Box sx={{ mt: 2, ml: 2, mr: 2, mb: 2 }}>
                {infoItems && infoItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                        <Box sx={{ flexShrink: 0, flexBasis: 'auto', display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                        </Box>
                        <Typography variant='subtitle2' sx={{ lineHeight: '24px' }}>{item.label}</Typography>
                    </Box>
                ))}
                <Typography variant="body2" sx={{ mt: 4 }}>{information}</Typography>
            </Box>}
        </Box>
    );
};

export default GridItem;
