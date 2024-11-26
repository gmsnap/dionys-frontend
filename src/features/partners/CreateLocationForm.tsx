"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Grid2,
    Typography,
    CircularProgress,
} from "@mui/material";
import { CreateLocationResponse, GeoLocation } from "@/types/geolocation";

const CreateLocationForm: React.FC = () => {
    const [formData, setFormData] = useState({
        title: "",
        city: "",
        area: "",
        streetAddress: "",
        postalCode: "",
        geoLocation: { type: "Point", coordinates: [0, 0] } as GeoLocation,
        image: null as File | null,
        price: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare data for the server
            const payload = {
                ...formData,
                image: formData.image ? formData.image.name : undefined, // Send only the filename if there's a file
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data: CreateLocationResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create location");
            }

            // If a presigned URL is returned, upload the file
            if (data.uploadUrl && formData.image) {
                await uploadFile(data.uploadUrl, formData.image);
            }

            setResponseMessage("Location created successfully!");
        } catch (error) {
            console.error(error);
            setResponseMessage("An error occurred while creating the location.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadFile = async (uploadUrl: string, file: File) => {
        try {
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload the file.");
            }

            setResponseMessage("File uploaded successfully!");
        } catch (error) {
            console.error(error);
            setResponseMessage("An error occurred during file upload.");
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom>
                Create Location
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Area"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Street Address"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Postal Code"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Latitude"
                            type="number"
                            name="latitude"
                            value={formData.geoLocation.coordinates[0]}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    geoLocation: {
                                        ...prev.geoLocation,
                                        coordinates: [
                                            parseFloat(e.target.value) || 0,
                                            prev.geoLocation.coordinates[1],
                                        ],
                                    },
                                }))
                            }
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Longitude"
                            type="number"
                            name="longitude"
                            value={formData.geoLocation.coordinates[1]}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    geoLocation: {
                                        ...prev.geoLocation,
                                        coordinates: [
                                            prev.geoLocation.coordinates[0],
                                            parseFloat(e.target.value) || 0,
                                        ],
                                    },
                                }))
                            }
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <Button variant="contained" component="label">
                            Upload Image
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>
                        {formData.image && <Typography>{formData.image.name}</Typography>}
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting}
                            startIcon={isSubmitting && <CircularProgress size={20} />}
                        >
                            {isSubmitting ? "Submitting..." : "Create Location"}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {responseMessage && (
                <Typography sx={{ mt: 2 }} color="primary">
                    {responseMessage}
                </Typography>
            )}
        </Box>
    );
};

export default CreateLocationForm;
