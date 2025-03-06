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

interface Props {
    image?: string;
    defaultImage?: string;
    onImageUpload: (imageUrl: string) => void; // Upload callback
    onImageDelete: (imageUrl: string) => void; // Image delete callback
}

const generateUploadUrlEndpoint =
    `${process.env.NEXT_PUBLIC_API_URL}/media/generate-image-upload-url`;

const SingleImageUploadForm: React.FC<Props> = ({
    image,
    defaultImage,
    onImageUpload,
    onImageDelete,
}) => {
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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

                setCurrentImage(imageUrl);
            } catch (error) {
                console.error("Image upload failed", error);
            } finally {
                setUploading(false);
            }
        }
    };

    // Handle image deletion
    const handleImageDelete = async (imageUrl: string) => {
        onImageDelete(imageUrl);
        setCurrentImage(defaultImage ?? null);
    };

    useEffect(() => {
        setCurrentImage(image || defaultImage || null);
    }, [image]);

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
                {currentImage ? (
                    <Box sx={{ width: "100%" }}>
                        <Box
                            component="img"
                            src={currentImage}
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

                            <Button
                                variant="contained"
                                component="label"
                                disabled={uploading}
                                sx={{
                                    lineHeight: 0,
                                    mb: 1,
                                    mr: 1,
                                }}
                            >
                                Bild ersetzen
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </Button>

                            <DeleteButton
                                isDisabled={uploading}
                                onDelete={() => handleImageDelete(currentImage)}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Noch keine Bilder vorhanden
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default SingleImageUploadForm;
