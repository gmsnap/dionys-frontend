import React, { useEffect, useState } from "react";
import {
    Grid2,
    Box,
    IconButton,
    Typography,
    Button,
    CircularProgress,
} from "@mui/material";
import { Delete, Upload, X } from "lucide-react";
import theme from "@/theme";
import DeleteButton from "@/components/DeleteButton";

// Define a type for the model
type Model = {
    images: string[];
};

// Props for the component
interface ImageUploadFormProps {
    model: Model; // Current model
    onImageUpload: (imageUrl: string) => void; // Upload callback
    onImageDelete: (imageUrl: string) => void; // Image delete callback
}

const generateUploadUrlEndpoint =
    `${process.env.NEXT_PUBLIC_API_URL}/media/generate-image-upload-url`;

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
    model,
    onImageUpload,
    onImageDelete,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Automatically select the first image when model.images changes
    useEffect(() => {
        if (model.images.length > 0) {
            setSelectedImage(model.images[0]);
        } else {
            setSelectedImage(null);
        }
    }, [model.images]);

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setUploading(true);
            const file = event.target.files[0];

            try {
                // Call API to get presigned URL and upload the file
                const response = await fetch(generateUploadUrlEndpoint, {
                    method: "POST",
                    body: JSON.stringify({ image: file.name }),
                    headers: { "Content-Type": "application/json" },
                });
                const { uploadUrl, imageUrl } = await response.json();

                // Upload to S3 or server
                await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                });

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
                                borderRadius: "12px",
                            }}
                        />
                        <Box
                            display={"flex"}
                            flexDirection={"row"}
                            justifyContent="flex-end"
                            sx={{ width: "100%" }}>

                            <DeleteButton
                                isDisabled={uploading}
                                onDelete={() => handleImageDelete(selectedImage)}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Noch keine Bilder vorhanden
                    </Typography>
                )}
            </Box>

            {/* Grid2 of Thumbnails */}
            <Grid2 container spacing={2} alignContent={"flex-start"}
                sx={{
                    width: "50%",
                }}
            >
                {model.images.map((image) => (
                    <Grid2 size={{ xs: 6 }} key={image}>
                        <Box
                            component="img"
                            src={image}
                            alt="Thumbnail"
                            sx={{
                                width: "100%",
                                height: "auto",
                                maxHeight: 100,
                                objectFit: "cover",
                                borderStyle: "solid",
                                borderColor: selectedImage === image
                                    ? theme.palette.customColors.blue.light
                                    : "transparent",
                                borderWidth: "2px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                overflow: "hidden",
                            }}
                            onClick={() => setSelectedImage(image)}
                        />
                    </Grid2>
                ))}
                {/* Add Image Button */}
                <Grid2 size={{ xs: 6 }} sx={{ maxHeight: 100, height: "100%" }}>
                    <Button
                        component="label"
                        fullWidth
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            backgroundColor: theme.palette.customColors.textBackground.halfdark,
                            borderRadius: "8px",
                            '&:hover': {
                                backgroundColor: theme.palette.customColors.blue.halfdark,
                            },
                            '.icon': {
                                color: theme.palette.customColors.blue.main,
                            },
                            '&:hover .icon': {
                                color: '#000000',
                            },
                        }}
                    >
                        {uploading ?
                            <CircularProgress className="icon" size={24} /> :
                            <Upload className="icon" />}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageUpload}
                        />
                    </Button>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default ImageUploadForm;
