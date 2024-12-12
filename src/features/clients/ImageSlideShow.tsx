import theme from "@/theme";
import { Box, IconButton, SxProps, Theme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ImageSlideShowProps {
    images: string[];
    title: string;
    sx?: SxProps<Theme>;
}

const ImageSlideShow = ({ images, title, sx }: ImageSlideShowProps) => {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const thumbnailsRef = useRef<HTMLDivElement>(null);
    const [showArrows, setShowArrows] = useState(false);
    const [fadingOut, setFadingOut] = useState(false);

    const thumbnailGap = 12;

    useEffect(() => {
        if (images.length > 0) {
            setSelectedImage(images[0]);
        }
    }, [images]);

    useEffect(() => {
        // Check if thumbnails overflow the container
        /*if (thumbnailsRef.current) {
            const isOverflowing =
                thumbnailsRef.current.scrollWidth > thumbnailsRef.current.clientWidth;
            setShowArrows(isOverflowing);
        }*/
        setShowArrows(images.length > 4);
    }, [images]);

    const handleScroll = (direction: "left" | "right") => {
        const scrollAmount = 200;
        const maxScroll = thumbnailsRef.current
            ? thumbnailsRef.current.scrollWidth - thumbnailsRef.current.clientWidth
            : 0;

        setScrollPosition((prev) => {
            const newScrollPosition =
                direction === "left" ? prev - scrollAmount : prev + scrollAmount;
            return Math.max(0, Math.min(newScrollPosition, maxScroll));
        });
    };

    // Thumbnail width calculation
    const calculateThumbnailWidth = (): string => {
        const len = images.length;
        const gap = ((len - 1) / len) * thumbnailGap;
        if (len <= 4) {
            // Scale thumbnails to fill the full width
            return `calc(${100 / len}% - ${gap}px)`;
        }
        // 4 thumbnails fill the full width
        return `calc(25% - ${gap}px)`;
    };

    if (images.length === 1) {
        return (
            <Box sx={{ mr: 5, ...sx }}>
                {/* Only one image */}
                <Box
                    component="img"
                    sx={{
                        width: "100%",
                        objectFit: "fill",
                        borderRadius: "16px",
                        aspectRatio: "16/10",
                    }}
                    src={selectedImage}
                    alt={title}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ mr: 5, ...sx }}>
            {/* Large Image (upper row) */}
            <Box
                component="img"
                draggable={false}
                sx={{
                    width: "100%",
                    objectFit: "fill",
                    borderRadius: "16px",
                    aspectRatio: "16/10",
                    opacity: fadingOut ? 0.5 : 1,
                    transition: "opacity 0.2s ease-in",
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
                    position: "relative",
                }}
            >
                {/* Left Arrow Button */}
                {showArrows && (
                    <IconButton
                        onClick={() => handleScroll("left")}
                        sx={{
                            position: "absolute",
                            left: "-32px",
                            zIndex: 1,
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>
                )}

                <Box
                    ref={thumbnailsRef}
                    sx={{
                        display: "flex",
                        overflow: images.length > 4 ? "hidden" : "visible",
                        flexGrow: 1,
                        justifyContent: images.length <= 4 ? "space-evenly" : "unset",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: `${thumbnailGap}px`,
                            transform: `translateX(-${scrollPosition}px)`,
                            transition: "transform 0.3s ease",
                        }}
                    >
                        {/* Thumbnail Images */}
                        {images.map((image, index) => (
                            <Box
                                key={index}
                                component="img"
                                draggable={false}
                                onClick={() => {
                                    if (selectedImage !== image) {
                                        setFadingOut(true); // Start fade-out effect
                                        setTimeout(() => {
                                            setSelectedImage(image); // Change image after fade-out
                                            setFadingOut(false); // Start fade-in effect
                                        }, 200); // Match the duration of the fade-out animation
                                    }
                                }}
                                sx={{
                                    cursor: "pointer",
                                    width: calculateThumbnailWidth(),
                                    objectFit: "cover",
                                    aspectRatio: "16/10",
                                    borderRadius: "8px",
                                    borderStyle: "solid",
                                    borderWidth: "2px",
                                    borderColor:
                                        selectedImage === image
                                            ? theme.palette.customColors.pink.light
                                            : "transparent",
                                }}
                                src={image}
                                alt={`${title} thumbnail ${index + 1}`}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Right Arrow Button */}
                {showArrows && (
                    <IconButton
                        onClick={() => handleScroll("right")}
                        sx={{
                            position: "absolute",
                            right: "-32px",
                            zIndex: 1,
                        }}
                    >
                        <ChevronRight />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
};

export default ImageSlideShow;
