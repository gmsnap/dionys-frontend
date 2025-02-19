import theme from "@/theme";
import { Box, Typography } from "@mui/material";

interface ImmutableItemListProps {
    strings: string[];
}

const ImmutableItemList: React.FC<ImmutableItemListProps> = ({ strings }) => {
    return (
        <Box>
            {strings.map((s, index) => (
                <Typography key={index} sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    letterSpacing: '-0.07em',
                    lineHeight: 2,
                    color: theme.palette.customColors.text.input,
                    backgroundColor: theme.palette.customColors.textBackround.halfdark,
                    borderRadius: '6px 0 0 6px',
                    pl: 2,
                    pr: 2,
                    mb: 2,
                }}>
                    {s}
                </Typography>
            ))}
        </Box>
    );
};

export default ImmutableItemList;