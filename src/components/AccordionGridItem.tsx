import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { boolean } from 'yup';

interface GridItemProps {
    id: number;
    image: string;
    isSelected?: boolean;
    selectRequested?: (id: number) => void;
    title: string;
    subTitle: string;
    information?: string;
}

const GridItem: React.FC<GridItemProps> = ({
    id,
    image,
    isSelected,
    selectRequested,
    title,
    subTitle,
    information,
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
                <Box
                    component="img"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                    }}
                    src={image}
                    alt={title}
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
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "'Nunito', sans-serif",
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            mt: 2,
                            opacity: 0.75,
                        }}
                    >
                        {title}<br />{subTitle}
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
                <Typography variant="body2">{information}</Typography>
            </Box>}
        </Box>
    );
};

export default GridItem;
