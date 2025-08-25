import React, { useEffect, useState } from "react";
import {
    Grid2,
    Box,
    Typography,
    CircularProgress,
} from "@mui/material";
import { Upload } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import theme from "@/theme";
import DeleteButton from "@/components/DeleteButton";
import { compressImage } from "@/utils/fileUtil";

// Define a type for the model
type Model = {
    images: string[];
};

// Props for the component
interface ImageUploadFormProps {
    model: Model;
    onImageUpload: (imageUrl: string) => void;
    onImageDelete: (imageUrl: string) => void;
    onImagesReorder: (images: string[]) => void;
}

// Define item type for react-dnd
const ItemTypes = {
    IMAGE: "image",
};

// Draggable Image Thumbnail Component
interface DraggableImageProps {
    image: string;
    index: number;
    selectedImage: string | null;
    moveImage: (fromIndex: number, toIndex: number) => void;
    onDrop: () => void; // Updated to not pass images directly
    setSelectedImage: (image: string) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
    image,
    index,
    selectedImage,
    moveImage,
    onDrop,
    setSelectedImage,
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.IMAGE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.IMAGE,
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveImage(item.index, index);
                item.index = index; // Update the dragged item's index
            }
        },
        drop: () => {
            onDrop(); // Call onDrop when the drag ends
        },
    });

    // Combine drag and drop refs
    const ref = (node: HTMLImageElement | null) => {
        drag(node);
        drop(node);
    };

    return (
        <Grid2 size={{ xs: 6 }} key={image}>
            <Box
                ref={ref}
                component="img"
                src={image}
                alt="Thumbnail"
                sx={{
                    width: "100%",
                    objectFit: "cover",
                    borderStyle: "solid",
                    borderColor: selectedImage === image
                        ? theme.palette.customColors.blue.light
                        : "transparent",
                    borderWidth: "2px",
                    borderRadius: "4px",
                    aspectRatio: "4/3",
                    cursor: "move",
                    opacity: isDragging ? 0.5 : 1,
                }}
                onClick={() => setSelectedImage(image)}
            />
        </Grid2>
    );
};

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
    model,
    onImageUpload,
    onImageDelete,
    onImagesReorder,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>(model.images);

    // Sync local images state with model.images prop
    useEffect(() => {
        setImages(model.images);
        if (model.images.length > 0) {
            setSelectedImage(model.images[0]);
        } else {
            setSelectedImage(null);
        }
    }, [model.images]);

    // Handle image reordering (local state only)
    const moveImage = (fromIndex: number, toIndex: number) => {
        const updatedImages = [...images];
        const [movedImage] = updatedImages.splice(fromIndex, 1);
        updatedImages.splice(toIndex, 0, movedImage);
        setImages(updatedImages); // Update local state for UI
    };

    // Handle drop event to notify parent
    const handleDrop = () => {
        onImagesReorder(images); // Notify parent with final images array
    };

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setUploading(true);

            try {
                const fileToUpload: File = await compressImage(event.target.files[0]);

                // Call API to get presigned URL
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/media/generate-image-upload-url`,
                    {
                        method: "POST",
                        body: JSON.stringify({ image: fileToUpload.name }),
                        headers: { "Content-Type": "application/json" },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to get upload URL.");
                }

                const { uploadUrl, imageUrl } = await response.json();

                // Upload the (compressed) image
                const uploadResponse = await fetch(uploadUrl, {
                    method: "PUT",
                    body: fileToUpload,
                    headers: {
                        "Content-Type": fileToUpload.type,
                    },
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload the image.");
                }

                // Notify parent about the new image URL
                onImageUpload(imageUrl);
            } catch (error) {
                console.error("Image upload failed", error);
            } finally {
                setUploading(false);
            }
        }
    };

    // Handle image deletion
    const handleImageDelete = async (imageUrl: string) => {
        try {
            /*await fetch("/api/delete", {
                method: "POST",
                body: JSON.stringify({ imageUrl }),
                headers: { "Content-Type": "application/json" },
            });*/

            // Notify parent about the deleted image
            onImageDelete(imageUrl);
        } catch (error) {
            console.error("Image delete failed", error);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Box display="flex" flexDirection="row" gap={2}>
                {/* Enlarged Selected Image */}
                <Box
                    sx={{
                        width: "50%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        alignSelf: "flex-start",
                        height: "100%",
                    }}
                >
                    {selectedImage ? (
                        <Box sx={{ width: "100%" }}>
                            <Box
                                component="img"
                                src={selectedImage}
                                alt="Selected"
                                sx={{
                                    width: "100%",
                                    height: "auto",
                                    maxHeight: 300,
                                    objectFit: "contain",
                                    borderRadius: "6px",
                                }}
                            />
                            <Box
                                display={"flex"}
                                flexDirection={"row"}
                                justifyContent="flex-end"
                                sx={{ width: "100%" }}
                            >
                                <DeleteButton
                                    isDisabled={uploading}
                                    onDelete={() => handleImageDelete(selectedImage)}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body1" color="text.secondary">
                            Noch keine Bilder.<br />
                            <b>Bitte lade mindestens ein Bild hoch.</b>
                        </Typography>
                    )}
                </Box>

                {/* Grid2 of Thumbnails */}
                <Grid2
                    container
                    spacing={1}
                    alignContent={"flex-start"}
                    sx={{
                        width: "50%",
                        mb: 4,
                    }}
                >
                    {images.map((image, index) => (
                        <DraggableImage
                            key={image}
                            image={image}
                            index={index}
                            selectedImage={selectedImage}
                            moveImage={moveImage}
                            onDrop={handleDrop} // Pass handleDrop directly
                            setSelectedImage={setSelectedImage}
                        />
                    ))}
                    {/* Add Image Button */}
                    <Grid2 size={{ xs: 6 }} key={"imgAddBtn"}>
                        <Box
                            sx={{
                                width: "100%",
                                aspectRatio: "4/3",
                                borderRadius: "4px",
                                overflow: "hidden",
                                backgroundColor: theme.palette.customColors.textBackground.halfdark,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: theme.palette.customColors.blue.halfdark,
                                },
                            }}
                            onClick={() => document.getElementById("uploadInput")?.click()}
                        >
                            {uploading ? (
                                <CircularProgress className="icon" size={24} />
                            ) : (
                                <Upload className="icon" size={24} />
                            )}
                            <input
                                id="uploadInput"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageUpload}
                            />
                        </Box>
                    </Grid2>
                </Grid2>
            </Box>
        </DndProvider>
    );
};

export default ImageUploadForm;