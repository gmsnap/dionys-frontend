"use client";

import React, { useState, useEffect } from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { PartnerUserModel } from "@/models/PartnerUserModel";
import useStore from '@/stores/partnerStore';
import { fetchLocationByPartnerId } from "@/services/locationService";

const PartnerLoginForm: React.FC = ({ }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { partnerUser, setPartnerUser, setPartnerLocation } = useStore();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partner-users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid username or password");
            }

            const result = await response.json();
            setPartnerUser(result.user);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setPartnerUser(null);
    };

    useEffect(() => {
        if (partnerUser?.id) {
            fetchLocationByPartnerId(partnerUser.id, null, null)
                .then((location) => {
                    location && setPartnerLocation(location);
                });
        }
    }, [partnerUser]);

    return (
        <Box sx={{ textAlign: "center", p: 4 }}>
            {partnerUser ? (
                <>
                    <Typography variant="h3">
                        {partnerUser.givenName} {partnerUser.familyName}
                    </Typography>
                    <Typography variant="h5">{partnerUser.company}</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: 2 }}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </>
            ) : (
                <>
                    <Typography variant="h5" mb={2} sx={{ textTransform: "uppercase" }}>
                        Partner Login
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </>
            )}
        </Box>
    );
};

export default PartnerLoginForm;