import theme from "@/theme";
import { Box, Typography } from "@mui/material";
import React from "react";

interface Props {
    title: string;
    description?: string;
};

const PageHeadline = ({ title, description }: Props) => {
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
                    borderTop: `1px solid ${theme.palette.customColors.blue.halfdark}`,
                    width: '100%',
                    mt: 3,
                }}
            />
            {description &&
                <Typography
                    variant='body1'
                    sx={{
                        color: theme.palette.customColors.blue.dark,
                        maxWidth: { xs: '100%', md: '60%' },
                        mt: 3,
                        ml: 3,
                    }}
                >
                    {description.split('. ').map((part, index, array) => (
                        <React.Fragment key={index}>
                            {part}
                            {index < array.length - 1 && '.'}
                            {index < array.length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </Typography>
            }
        </>
    );
};

export default PageHeadline;