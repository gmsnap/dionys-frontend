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
                                borderRadius: "6px",
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
                        Noch keine Bilder.<br />
                        <b>Bitte lade mindestens ein Bild hoch.</b>
                    </Typography>
                )}
            </Box>

            {/* Grid2 of Thumbnails */}
            <Grid2 container spacing={1} alignContent={"flex-start"}
                sx={{
                    width: "50%",
                    mb: 4,
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
                                objectFit: "cover",
                                borderStyle: "solid",
                                borderColor: selectedImage === image
                                    ? theme.palette.customColors.blue.light
                                    : "transparent",
                                borderWidth: "2px",
                                borderRadius: "4px",
                                aspectRatio: "4/3",
                                cursor: "pointer",
                            }}
                            onClick={() => setSelectedImage(image)}
                        />
                    </Grid2>
                ))}
                {/* Add Image Button */}
                <Grid2 size={{ xs: 6 }} key={"imgAddBtn"}>
                    <Box
                        sx={{
                            width: '100%',
                            aspectRatio: '4/3',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            backgroundColor: theme.palette.customColors.textBackground.halfdark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': {
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
    );
};

export default ImageUploadForm;
