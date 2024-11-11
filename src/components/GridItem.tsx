import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface ListItem {
    icon: React.ReactNode;
    label: string;
}

interface GridItemProps {
    image: string;
    title: string;
    priceTag: string;
    listItems: ListItem[];
}

const GridItem: React.FC<GridItemProps> = ({ image, title, priceTag, listItems }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            margin: 0,
            padding: 0,
        }}
    >
        {/* Image at the top */}
        <Box
            component="img"
            sx={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                margin: 0,
                padding: 0,
            }}
            src={image}
            alt={title}
        />

        <Box sx={{ mt: 2, ml: 2, mr: 2, display: 'flex', gap: 2, alignItems: 'baseline' }}>
            {/* Title below the image */}
            <Typography
                variant="h6"
                sx={{ fontFamily: "'Gugi', sans-serif" }}>
                {title} (can be very long)
            </Typography>
            <Typography sx={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'right',
                whiteSpace: 'nowrap', // Prevents breaking into multiple lines 
                flexShrink: 0, // Prevents shrinking when the container gets smaller
            }}>
                {priceTag}
            </Typography>
        </Box>

        {/* Info items */}
        <Box sx={{ mt: 2, ml: 2, mr: 2 }}>
            {listItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    <Typography>{item.label}</Typography>
                </Box>
            ))}
        </Box>

        {/* Buttons at the bottom */}
        <Box sx={{ mt: 2, ml: 2, mr: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" sx={{ flex: 1 }}>
                Mehr Details
            </Button>
            <Button variant="contained" color="secondary" sx={{ flex: 1 }}>
                Jetzt Konfigurieren
            </Button>
        </Box>
    </Box>
);

export default GridItem;
