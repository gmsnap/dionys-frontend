"use client"

import type React from "react"
import { useState } from "react"
import { Box, IconButton, SxProps, Theme, useTheme } from "@mui/material"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface Props {
    images: string[];
    sx?: SxProps<Theme>;
}

const ImageSlideshow = ({ images, sx }: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const theme = useTheme()

    const goToPrevious = () => {
        setDirection(-1)
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1))
    }

    const goToNext = () => {
        setDirection(1)
        setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0))
    }

    return (
        <Box sx={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            ...sx
        }}>
            <AnimatePresence initial={false} custom={direction}>
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex] || "/placeholder.svg"}
                    alt={`Slide ${currentIndex + 1}`}
                    custom={direction}
                    variants={{
                        enter: (direction: number) => ({
                            x: direction > 0 ? 300 : -300,
                            opacity: 0,
                        }),
                        center: {
                            zIndex: 1,
                            x: 0,
                            opacity: 1,
                        },
                        exit: (direction: number) => ({
                            zIndex: 0,
                            x: direction < 0 ? 300 : -300,
                            opacity: 0,
                        }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                    }}
                />
            </AnimatePresence>
            {images.length > 1 && (
                <>
                    <IconButton
                        onClick={goToPrevious}
                        sx={{
                            position: "absolute",
                            left: 0,
                            p: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "white",
                            zIndex: 100,
                        }}
                        size="large"
                    >
                        <ChevronLeft
                            size={65}
                            viewBox="10 2 10 20"
                            strokeWidth={1}
                            color="white"
                        />
                    </IconButton>
                    <IconButton
                        onClick={goToNext}
                        sx={{
                            position: "absolute",
                            right: 0,
                            p: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 100,
                        }}
                        size="large"
                    >
                        <ChevronRight
                            size={65}
                            viewBox="4 2 10 20"
                            strokeWidth={1}
                            color="white"
                        />
                    </IconButton>
                </>
            )}
        </Box>
    )
}

export default ImageSlideshow
