import theme from "@/theme";
import { Box, SxProps, Theme } from "@mui/material";
import { Plus } from "lucide-react";

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
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    margin: 'auto',
                    padding: 0,
                }}
            >
                <Plus
                    color={theme.palette.customColors.blue.main}
                    strokeWidth={1}
                    size={180} />
            </Box>
        </Box>
    );
};

export default GridAddItem;
