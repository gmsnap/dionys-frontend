import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface ListItem {
    icon: React.ReactNode;
    label: string;
}

interface GridItemProps {
    id: number,
    image: string;
    title: string;
    priceTag: string;
    listItems: ListItem[];
    buttons: React.ReactNode[] | null;
}

const GridItem: React.FC<GridItemProps> = (
    {
        id,
        image,
        title,
        priceTag,
        listItems,
        buttons,
    }) => {

    return (
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
                    objectFit: 'fill',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    margin: 0,
                    padding: 0,
                }}
                src={image}
                alt={title}
            />

            <Box sx={{ mt: 2, ml: 2, mr: 2, mb: 2 }}>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
                    {/* Title below the image */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: 'nowrap', // No multiple lines 
                            overflow: 'hidden', // Hides the overflowing text
                            textOverflow: 'ellipsis', // Adds '...' when text is truncated
                            flexGrow: 1, // Take up available space
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        fontWeight: 600,
                        textAlign: 'right',
                        whiteSpace: 'nowrap', // No multiple lines 
                        flexShrink: 0, // Prevent shrinking when the container gets smaller
                    }}>
                        {priceTag}
                    </Typography>
                </Box>

                {/* Info items */}
                <Box sx={{ mt: 3, maxWidth: '80%' }}>
                    {listItems.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                            <Box sx={{ flexShrink: 0, flexBasis: 'auto', display: 'flex', alignItems: 'center' }}>
                                {item.icon}
                            </Box>
                            <Typography variant='subtitle2' sx={{ lineHeight: '24px' }}>{item.label}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Buttons at the bottom */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    {buttons && buttons.map((button, index) => (
                        button
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default GridItem;
