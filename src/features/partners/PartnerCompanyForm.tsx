"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Grid2, useTheme } from "@mui/material";
import useStore from "@/stores/partnerStore";
import router from "next/router";
import { fetchCompanyById } from "@/services/partnerService";
import { PartnerCompanyModel } from "@/models/PartnerCompanyModel";

const PartnerCompanyForm: React.FC = () => {
    const theme = useTheme();

    const { partnerUser, setPartnerUser } = useStore();

    const [formData, setFormData] = useState({
        companyName: "",
        companyRegistrationNumber: "",
        companyTaxId: "",
        contactEmail: "",
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

        if (!formData.companyName) {
            setError("Company Name is required.");
            setSuccess(false);
            return;
        }

        try {
            if (!partnerUser) {
                setError("Please login.");
                setSuccess(false);
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/partner-companies/${partnerUser?.companyId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const updatedCompany = (await response?.json())?.company as PartnerCompanyModel;

            if (updatedCompany) {
                // Update partnerUser's company in the store
                setPartnerUser({
                    ...partnerUser,
                    company: updatedCompany,
                });
            }

            setError(null);
            setSuccess(true);

        } catch (err) {
            console.error("Error updating company:", err);
            setError("Failed to update company. Please try again.");
            setSuccess(false);
        }
    };

    useEffect(() => {
        if (partnerUser?.companyId) {
            const fetchCompany = async (companyId: number) => {
                const response = await fetchCompanyById(companyId, null, null);
                if (!response || !response.response.ok) {
                    console.log(
                        `Error ${response?.response.status}: ${response?.response.statusText}`
                    );
                    return;
                }

                setFormData(() => ({
                    ...response.result,
                }));
            };

            fetchCompany(partnerUser.companyId);
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
                    {/* Company Name */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Firmenname</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="companyName"
                                    value={formData.companyName}
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
                                <Typography>Handelsregister-Nr.</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="companyRegistrationNumber"
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
                                    value={formData.companyTaxId}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Contact Email */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Kontakt-Email</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8 }}>
                                <TextField
                                    name="contactEmail"
                                    value={formData.contactEmail}
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
                            <Typography color="success">Unternehmensdaten wurden aktualisiert.</Typography>
                        </Grid2>
                    )}
                </Grid2>
            </form>
        </Box>
    );
};

export default PartnerCompanyForm;
