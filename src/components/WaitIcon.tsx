import { Box, CircularProgress, SxProps, Theme } from "@mui/material";

interface Props {
    sx?: SxProps<Theme>;
}

export const WaitIcon = ({ sx }: Props) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                height: '64px',
                mt: 5,
                ...sx
            }}
        >
            <CircularProgress size={32} color="secondary" />
        </Box>
    );
};