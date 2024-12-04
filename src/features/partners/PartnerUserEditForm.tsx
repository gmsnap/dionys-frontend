"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Grid2, useTheme } from "@mui/material";
import useStore from "@/stores/partnerStore";
import router from "next/router";

const PartnerUserEditForm: React.FC = () => {
    const theme = useTheme();

    const { partnerUser, setPartnerUser } = useStore();

    const [formData, setFormData] = useState({
        givenName: partnerUser?.givenName || "",
        familyName: partnerUser?.familyName || "",
        email: partnerUser?.email || "",
        company: partnerUser?.company || "",
        companyRegistrationNumber: partnerUser?.companyRegistrationNumber || "",
        companyTaxId: partnerUser?.companyTaxId || "",
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.givenName || !formData.familyName) {
            setError("Name and email are required.");
            setSuccess(false);
            return;
        }

        try {
            const response =
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partner-users/${partnerUser?.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            ...partnerUser,
                            ...formData,
                        }),
                    });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const updatedUser = await response.json();
            setPartnerUser(updatedUser.user);
            setError(null);
            setSuccess(true);
        } catch (err) {
            setError("Failed to update profile. Please try again.");
            setSuccess(false);
        }
    };

    useEffect(() => {
        if (partnerUser) {
            setFormData({
                givenName: partnerUser.givenName,
                familyName: partnerUser.familyName,
                email: partnerUser.email,
                company: partnerUser.company,
                companyRegistrationNumber: partnerUser.companyRegistrationNumber,
                companyTaxId: partnerUser.companyTaxId,
            });
        }
    }, [partnerUser]);

    if (!partnerUser) {
        return (
            <Box sx={{ textAlign: "center", pt: 4, width: "100%", margin: "0 auto" }}>
                <Typography variant="body1" gutterBottom>Please Login</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/partner')}
                >
                    Login
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{
            textAlign: "left",
            maxWidth: "600px",
        }}>
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    {/* Given Name */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Vorname</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="givenName"
                                    value={formData.givenName}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Family Name */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Nachname</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="familyName"
                                    value={formData.familyName}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Email */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Email</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Company */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Company</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="company"
                                    type="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Company Registration Number */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Handelsregisternummer</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="companyRegistrationNumber"
                                    type="companyRegistrationNumber"
                                    value={formData.companyRegistrationNumber}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Company Tax Id */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>USt-ID</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="companyTaxId"
                                    type="companyTaxId"
                                    value={formData.companyTaxId}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Submit */}
                    <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <Button variant="contained" color="primary" type="submit">
                            Speichern
                        </Button>
                    </Grid2>

                    {/* Messages */}
                    {error && (
                        <Grid2 size={{ xs: 12 }}>
                            <Typography color="error">{error}</Typography>
                        </Grid2>
                    )}
                    {success && (
                        <Grid2 size={{ xs: 12 }}>
                            <Typography color="success">Profil gespeichert!</Typography>
                        </Grid2>
                    )}
                </Grid2>
            </form>
        </Box>
    );
};

export default PartnerUserEditForm;
