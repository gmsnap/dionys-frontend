import { Box, SxProps, Theme } from "@mui/material";

interface GridAddItemProps {
    id: number;
    handler: () => void;
    sx?: SxProps<Theme>;
}

const GridAddItem: React.FC<GridAddItemProps> = (
    {
        id,
        handler,
        sx,
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
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                    backgroundColor: '#f0f0f0',
                },
                ...sx,
            }}
            onClick={handler}
        >
            {/* Add-Image */}
            <Box
                component="img"
                sx={{
                    width: '100%',
                    objectFit: 'scale-down',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    margin: 'auto 0',
                    padding: 0,
                }}
                src='/add-item.png'
                alt='Add Item'
            />
        </Box>
    );
};

export default GridAddItem;
