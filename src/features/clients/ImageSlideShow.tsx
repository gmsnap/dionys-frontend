import theme from "@/theme";
import { Box, IconButton, SxProps, Theme } from "@mui/material";
import { ArrowLeft, ChevronLeft, ChevronRight, CircleArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageSlideShowProps {
    images: string[];
    title: string;
    sx?: SxProps<Theme>;
}

const ImageSlideShow = ({ images, title, sx }: ImageSlideShowProps) => {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        if (images.length > 0) {
            setSelectedImage(images[0]);
        }
    }, [images]);

    const handleScroll = (direction: "left" | "right") => {
        const scrollAmount = 100; // Adjust scroll amount as needed
        setScrollPosition((prev) =>
            direction === "left" ? prev - scrollAmount : prev + scrollAmount
        );
    };

    return (
        <Box
            sx={{
                mr: 5,
                ...sx,
            }}
        >
            {/* Large Image (upper row) */}
            <Box
                component="img"
                sx={{
                    width: "calc(100% - 24px)",
                    objectFit: "fill",
                    borderRadius: "16px",
                    ml: '12px',
                    aspectRatio: '4/3',
                }}
                src={selectedImage}
                alt={title}
            />

            {/* Thumbnail Row (lower row) */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    mt: "8px",
                }}
            >
                {/* Left Arrow Button */}
                <IconButton onClick={() => handleScroll("left")}>
                    <ChevronLeft />
                </IconButton>

                <Box
                    sx={{
                        display: "flex",
                        gap: "8px", // Add spacing between thumbnails
                        overflow: "hidden", // Hide overflowed thumbnails
                        flexGrow: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: "12px",
                            transform: `translateX(-${scrollPosition}px)`,
                            transition: "transform 0.3s ease",
                        }}
                    >
                        {/* Thumbnail Imges */}
                        {images.map((image, index) => (
                            <Box
                                key={index}
                                component="img"
                                onClick={() => setSelectedImage(image)}
                                sx={{
                                    cursor: "pointer",
                                    width: "160px",
                                    height: "90px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    borderStyle: "solid",
                                    borderWidth: '2px',
                                    borderColor: selectedImage === image ?
                                        theme.palette.customColors.pink.light :
                                        "transparent",
                                }}
                                src={image}
                                alt={`${title} thumbnail ${index + 1}`}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Right Arrow Button */}
                <IconButton onClick={() => handleScroll("right")}>
                    <ChevronRight />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ImageSlideShow;
