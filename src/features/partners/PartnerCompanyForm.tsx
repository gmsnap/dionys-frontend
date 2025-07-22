import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Grid2,
    Switch,
    FormControlLabel,
} from "@mui/material";
import useStore from "@/stores/partnerStore";
import router from "next/router";
import { fetchCompanyById, updatePartnerCompany } from "@/services/partnerService";
import BillingAddressFields from "./BillingAddressFields";
import { useAuthContext } from "@/auth/AuthContext";
import { PartnerCompanyModel } from "@/models/PartnerCompanyModel";

interface Props {
    submitButtonCaption?: string;
    onComplete?: (id: number) => void;
}

const PartnerCompanyForm = ({ submitButtonCaption, onComplete }: Props) => {
    const { authUser } = useAuthContext();
    const { partnerUser, setPartnerUser } = useStore();

    const [formData, setFormData] = useState({
        companyName: "",
        companyRegistrationNumber: "",
        companyTaxId: "",
        contactEmail: partnerUser?.email ?? "",
        phoneNumber: "",
        address: { city: "", streetAddress: "", postalCode: "", country: "" },
        billingAddress: { city: "", streetAddress: "", postalCode: "", country: "" },
        billingAddressId: null,
        billingDetails: { contactPerson: "" },
    });

    const [billingToggle, setBillingToggle] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const keys = name.split(".");

        setFormData((prevData) => {
            const updatedData = { ...prevData };
            let currentLevel: any = updatedData;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                currentLevel[key] = currentLevel[key] ?? {};
                currentLevel = currentLevel[key];
            }

            currentLevel[keys[keys.length - 1]] = value;
            return updatedData;
        });
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const toggleState = e.target.checked;
        setBillingToggle(toggleState);

        if (toggleState) {
            setFormData({
                ...formData,
                billingAddress: { city: "", streetAddress: "", postalCode: "", country: "" },
                billingAddressId: null,
            });
        }
    };

    const filterPartnerCompanyData = (data: any) => {
        // Create a new object
        const { ...filteredData } = data;

        // If billingAddress toggle is on, we ensure null is explicitly sent
        if (billingToggle) {
            filteredData.billingAddressId = null;
            filteredData.billingAddress = null;
        }

        return filteredData;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        if (!formData.companyName) {
            setError("Firmenname ist erforderlich.");
            setSuccess(false);
            setIsSubmitting(false);
            return;
        }

        if (!formData.address?.city ||
            !formData.address?.streetAddress ||
            !formData.address?.country ||
            !formData.address?.postalCode) {
            setError("Die Adresse ist noch nicht vollständig.");
            setSuccess(false);
            setIsSubmitting(false);
            return;
        }

        try {
            if (!partnerUser || !authUser) {
                setError("Please login.");
                setSuccess(false);
                setIsSubmitting(false);
                return;
            }

            if (!partnerUser?.companyId) {
                setError("Invalid Company.");
                setSuccess(false);
                setIsSubmitting(false);
                return;
            }

            // Use the filter utility to prepare the data for submission
            const dataToSubmit = filterPartnerCompanyData(formData);

            await updatePartnerCompany(
                authUser.idToken,
                partnerUser.companyId,
                dataToSubmit,
                (response: any) => {
                    const updatedCompany = response?.company as PartnerCompanyModel;
                    if (updatedCompany) {
                        // Update partnerUser's company in the store
                        setPartnerUser({
                            ...partnerUser,
                            company: updatedCompany,
                        });
                        setError(null);
                        setSuccess(true);
                        onComplete?.(updatedCompany.id);
                    }
                },
                (message) => {
                    setError(message ?? "Unknown Error");
                    setSuccess(false);
                }
            );

        } catch (err) {
            console.error("Error updating company:", err);
            setError("Failed to update company. Please try again.");
            setSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (partnerUser?.companyId) {
            const fetchCompany = async (companyId: number) => {
                const response = await fetchCompanyById(companyId, null, null);
                if (response && response.response.ok) {
                    setFormData({
                        ...response.result,
                        address: response.result.address || {
                            city: "",
                            streetAddress: "",
                            postalCode: "",
                            country: "",
                        },
                        billingAddress:
                            response.result.billingAddress || {
                                city: "",
                                streetAddress: "",
                                postalCode: "",
                                country: "",
                            },
                    });

                    setBillingToggle(response.result.billingAddressId === null);
                }
            };

            fetchCompany(partnerUser.companyId);
        }
    }, [partnerUser]);

    if (!partnerUser) {
        return (
            <Box sx={{ textAlign: "center", pt: 4, width: "100%", margin: "0 auto" }}>
                <Typography variant="body1" gutterBottom>
                    Please Login
                </Typography>
                <Button variant="contained" color="primary" onClick={() => router.push("/partner")}>
                    Login
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: "left", maxWidth: "600px" }}>
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    <Typography variant="h5" sx={{ mb: 1, color: "primary.main" }}>
                        Unternehmen
                    </Typography>

                    {/* Company Info */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Firmenname</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
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
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Handelsregister-Nr.</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
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
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Umsatzsteuer-ID</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
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
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Kontakt-E-Mail</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
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
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Telefonnummer</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Ansprechpartner</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    name="billingDetails.contactPerson"
                                    value={formData.billingDetails?.contactPerson || ""}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Address */}
                    <Typography variant="h5" sx={{ mt: 3, mb: 1, color: "primary.main" }}>
                        Adresse
                    </Typography>
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Straße, Nr.</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    name="address.streetAddress"
                                    value={formData.address.streetAddress}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* City */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Stadt</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">PLZ</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    name="address.postalCode"
                                    value={formData.address.postalCode}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="top">
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Typography variant="label">Land</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    {/* Billing Address */}
                    <Typography variant="h5" sx={{ mt: 3, mb: 1, color: "primary.main" }}>
                        Rechnungsadresse
                    </Typography>

                    {/* Billing Address Toggle */}
                    <Grid2 size={{ xs: 12 }}>
                        <FormControlLabel
                            control={<Switch checked={billingToggle} onChange={handleToggle} />}
                            label="entspricht Unternehmensadresse"
                        />
                    </Grid2>

                    {/* Billing Address Fields */}
                    {!billingToggle &&
                        <BillingAddressFields formData={formData} handleChange={handleChange} />}

                    {/* Submit */}
                    <Grid2 size={{ xs: 12, }} sx={{ mt: 3, mb: 12 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                                sx={{ maxWidth: { xs: '100%', md: 150 } }}
                            >
                                {submitButtonCaption || "Speichern"}
                            </Button>
                            {error && <Typography sx={{ color: "red", mt: 2 }}>{error}</Typography>}
                            {success && (
                                <Typography color="secondary" sx={{ mt: 2 }}>
                                    Unternehmensdaten gespeichert.
                                </Typography>
                            )}
                        </Box>
                    </Grid2>
                </Grid2>
            </form>
        </Box>
    );
};

export default PartnerCompanyForm;
