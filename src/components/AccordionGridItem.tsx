import React, { useState } from 'react';
import { Box, Button, Typography, TextField, IconButton, InputAdornment } from '@mui/material';
import ImageSlideshow from '@/features/clients/ImageSlideShow';
import { Minus, Plus } from 'lucide-react';

interface InfoItem {
    icon: React.ReactNode;
    label: string;
}

interface GridItemProps {
    id: number;
    images: string[];
    isSelected?: boolean;
    selectRequested?: (id: number, quantity?: number) => void;
    title: string;
    subTitle?: string;
    information?: string;
    additionalNotes?: string | null;
    infoItems?: InfoItem[];
    maxQuantity?: number;
    isActive?: boolean;
    initialQuantity?: number;
}

const GridItem: React.FC<GridItemProps> = ({
    id,
    images,
    isSelected,
    selectRequested,
    title,
    subTitle,
    information,
    additionalNotes,
    infoItems,
    maxQuantity,
    isActive,
    initialQuantity,
}) => {
    const [showInformation, setShowInformation] = useState(false);
    const [quantity, setQuantity] = useState(initialQuantity);

    const handleQuantityChange = (newValue: number) => {
        const newQuantity = Math.max(1, Math.min(newValue, maxQuantity || Infinity));
        setQuantity(newQuantity);
        selectRequested?.(id, newQuantity);
    };

    const handleSelect = () => {
        const qty = maxQuantity === undefined ? 1 : quantity;
        selectRequested?.(id, qty);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                position: 'relative',
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
                    sx={{ height: '250px' }}
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
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            mt: 2,
                            opacity: 0.75,
                        }}
                    >
                        {title}
                        {subTitle && (
                            <>
                                {subTitle.split("|").map((part, index) => (
                                    <React.Fragment key={index}>
                                        <span
                                            style={{
                                                fontSize: '80%',
                                                display: 'block',
                                            }}
                                        >
                                            {part.trim()}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </>
                        )}
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
                        alignItems: 'center',
                    }}
                >
                    {information && (
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ padding: '8px 16px' }}
                            onClick={() => setShowInformation(!showInformation)}
                        >
                            Informationen
                        </Button>
                    )}
                    {isActive !== false && (
                        <Button
                            variant="contained"
                            color={isSelected ? "secondary" : "primary"}
                            sx={{
                                padding: '8px 16px',
                                backgroundColor: isSelected ? '#FFFFFF' : undefined,
                                color: isSelected ? '#000000' : undefined,
                                '&:hover': {
                                    backgroundColor: isSelected ? '#F5F5F5' : undefined,
                                },
                                borderRadius: 0,
                            }}
                            onClick={handleSelect}
                        >
                            {isSelected ? 'Ausgewählt' : 'Wählen'}
                        </Button>
                    )}
                    {isSelected && (maxQuantity === undefined || maxQuantity > 1) && (
                        <TextField
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(Number(e.target.value))}
                            sx={{
                                width: '100px',
                                backgroundColor: '#FFFFFF',
                                '& .MuiInputBase-input': {
                                    color: '#000000',
                                    textAlign: 'center',
                                    // Hide native number input spinners
                                    '-webkit-appearance': 'none',
                                    '-moz-appearance': 'textfield',
                                    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                                        '-webkit-appearance': 'none',
                                        margin: 0,
                                    },
                                },
                            }}
                            slotProps={{
                                input: {
                                    inputProps: { min: 1, max: maxQuantity },
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ marginRight: 0 }}>
                                            <IconButton
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= 1}
                                                sx={{ padding: '0px' }}
                                            >
                                                <Minus />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end" sx={{ marginLeft: 0 }}>
                                            <IconButton
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={quantity >= (maxQuantity || Infinity)}
                                                sx={{ padding: '0px' }}
                                            >
                                                <Plus />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* Description section (if needed outside the image) */}
            {showInformation && (
                <Box sx={{ mt: 2, ml: 2, mr: 2, mb: 2 }}>
                    {infoItems &&
                        infoItems.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                                <Box sx={{ flexShrink: 0, flexBasis: 'auto', display: 'flex', alignItems: 'center' }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="subtitle2" sx={{ lineHeight: '24px' }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    {additionalNotes && (
                        <Typography
                            variant="body2"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                fontWeight: 'bold',
                                mt: 4,
                            }}
                        >
                            {additionalNotes}
                        </Typography>
                    )}
                    <Typography
                        variant="body2"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: information ?? '' }}
                        sx={{
                            mt: 4,
                            "& ul, & ol": {
                                paddingLeft: 3,
                                marginTop: 1,
                                marginBottom: 1,
                            },
                            "& li": {
                                marginBottom: 0.5,
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default GridItem;