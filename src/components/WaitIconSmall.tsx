import { Box, CircularProgress, SxProps, Theme } from "@mui/material";

interface Props {
    sx?: SxProps<Theme>;
}

export const WaitIconSmall = ({ sx }: Props) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                height: '32px',
                mt: 1,
                ...sx
            }}
        >
            <CircularProgress size={32} color="secondary" />
        </Box>
    );
};