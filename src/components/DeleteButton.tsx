import React from 'react';
import { Button, Box } from '@mui/material';
import { X } from 'lucide-react';

interface DeleteButtonProps {
    isDisabled: boolean;
    onDelete: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ isDisabled, onDelete }) => {
    return (
        <Button
            variant="contained"
            disabled={isDisabled}
            sx={{
                lineHeight: 0,
                outline: '3px solid transparent',
                backgroundColor: '#ff0000',
                mb: 1,
                '&:hover': {
                    outline: '3px solid #FF000033',
                },
                '.icon': {
                    color: '#ffffff',
                },
                '&:hover .icon': {
                    color: '#ffffff',
                },
            }}
            onClick={onDelete}
        >
            Delete
            <Box component="span" sx={{ ml: 1 }}>
                <X className="icon" width={16} height={16} />
            </Box>
        </Button>
    );
};

export default DeleteButton;
