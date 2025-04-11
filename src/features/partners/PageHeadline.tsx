import { Box, Typography } from "@mui/material";

interface Props {
    title: string;
};

const PageHeadline = ({ title }: Props) => {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                <Typography
                    variant='h3'
                    sx={{
                        fontFamily: "'Arial', sans-serif",
                        ml: 3,
                    }}
                >
                    {title}
                </Typography>
            </Box>
            <Box
                sx={{
                    borderTop: (theme) => `1px solid ${theme.palette.customColors.blue.halfdark}`,
                    width: '100%',
                    mt: 3,
                }}
            />
        </>
    );
};

export default PageHeadline;