"use client";

import React, { useState, useEffect } from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import useStore from '@/stores/partnerStore';
import { fetchLocationByPartnerId } from "@/services/locationService";
import { useAuthContext } from '@/auth/AuthContext';

const PartnerLoginForm: React.FC = ({ }) => {
    const { authUser, login, logout } = useAuthContext();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { partnerUser, setPartnerUser, setPartnerLocation } = useStore();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Sign in with Amplify Auth
            const user = await login(username, password);
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

    const handleLogout = async () => {
        try {
            logout();
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    useEffect(() => {
        const fetchLocation = async () => {
            if (partnerUser?.id) {
                const location = await fetchLocationByPartnerId(partnerUser.id, null, null);
                if (location) {
                    setPartnerLocation(location);
                    return;
                }
            }
            setPartnerLocation(null);
        };

        fetchLocation();
    }, [partnerUser]);

    useEffect(() => {
        console.log("authUser:", authUser?.username);

        if (authUser?.username) {
            const fetchUserData = async () => {
                try {
                    // Fetch additional user data from your API
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partner-users/sub/${authUser.sub}`);

                    if (!response.ok) {
                        throw new Error("Failed to fetch user data");
                    }

                    const result = await response.json();
                    setPartnerUser(result);
                    console.log("db user:", result);
                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("An unknown error occurred");
                    }
                    setPartnerUser(null);
                } finally {
                    setIsLoading(false);
                }
            }

            fetchUserData();
            return;
        }

        setPartnerUser(null);
    }, [authUser]);

    return (
        <Box sx={{ textAlign: "center", p: 4 }}>
            {authUser ? (
                <>
                    <Typography variant="h3">
                        {authUser.givenName} {authUser.familyName}
                    </Typography>
                    <Typography variant="h5">{partnerUser?.company}</Typography>
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