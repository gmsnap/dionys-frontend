import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { styled } from '@mui/system';
import { Minus } from 'lucide-react';

interface CustomChipProps extends ChipProps {
    customDeleteIcon?: React.ReactElement; // Ensure correct typing
}

const CustomChip = styled((props: CustomChipProps) => {
    const { customDeleteIcon, ...chipProps } = props;
    return <Chip {...chipProps} deleteIcon={customDeleteIcon || <Minus />} />;
})(({ theme }) => ({
    borderRadius: '8px', // rounded corners
    '& .MuiChip-deleteIcon': {
        position: 'absolute',
        margin: 0,
        padding: '0 6px',
        right: 0,
        width: '28px',
        height: '100%',
        backgroundColor: theme.palette.customColors.pink.dark,
        color: 'white', // white "-" sign
        borderRadius: '0 8px 8px 0',
        '&:hover': {
            backgroundColor: 'purple',
        },
    },
    paddingRight: '16px', // center text
    backgroundColor: theme.palette.customColors.textBackround.halfdark,
    textAlign: 'left',
    justifyContent: 'flex-start',
    fontSize: '16px',
    fontFamily: "'Gugi', sans-serif",
    color: theme.palette.customColors.text.input,
}));

export default CustomChip;