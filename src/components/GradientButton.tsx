import theme from '@/theme';
import { Box, Button, ButtonProps } from '@mui/material';

interface GradientButtonProps extends ButtonProps {
    gradientColors?: string[];
}

export default function GradientButton({
    gradientColors = [
        theme.palette.customColors.blue.light,
        theme.palette.customColors.blue.main
    ],
    children,
    sx,
    ...props
}: GradientButtonProps) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
            {/* White background element */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px', // Adjust based on your button's border radius
                    zIndex: 0, // Ensure it stays behind the button
                }}
            />

            {/* Button with gradient text */}
            <Button
                variant="outlined"
                {...props}
                sx={{
                    fontSize: '20px',
                    position: 'relative', // This positions the button above the background
                    color: 'transparent', // Make the text color transparent so the gradient shows 
                    background: `linear-gradient(90deg, ${gradientColors.join(', ')})`, // Gradient for the text
                    WebkitBackgroundClip: 'text', // Apply the gradient to the text only
                    WebkitTextFillColor: 'transparent', // Make the text transparent to show the gradient
                    textTransform: 'none', // Prevent text from being capitalized automatically
                    padding: '10px 20px', // Adjust padding for the button
                    borderColor: gradientColors[gradientColors.length - 1], // Border color matching the gradient
                    zIndex: 1, // Ensure the button is on top of the white background
                    '&:hover': {
                        backgroundColor: '#F8F8F8', // Slightly darker white on hover
                        borderColor: gradientColors[gradientColors.length - 1],
                    },
                    ...sx, // Merge with any additional styles passed as props
                }}
            >
                {children}
            </Button>
        </Box>

    );
}

