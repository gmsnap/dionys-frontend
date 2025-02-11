"use client";

import React, { useState, useEffect } from "react";
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from "@mui/material";
import useStore from '@/stores/partnerStore';
import { useAuthContext } from '@/auth/AuthContext';
import ConfirmSignup from "../admins/ConfirmSignup";
import { useSetLocationByCurrentPartner } from "@/services/locationService";
import theme from "@/theme";
import { useHeaderContext } from "@/components/headers/PartnerHeaderContext";
import router from "next/router";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const PartnerLoginForm: React.FC = ({ }) => {
    const { authUser, login, logout } = useAuthContext();
    const { setIsOverlayOpen } = useHeaderContext();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmForm, setConfirmForm] = useState(false);
    const [error, setError] = useState("");

    const { partnerUser, setPartnerUser } = useStore();

    useSetLocationByCurrentPartner();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Sign in with Amplify Auth
            const result = await login(username, password);
            if (result?.status === 'confirm') {
                setConfirmForm(true);
            }
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
        console.log("authUser:", authUser?.username);

        if (authUser?.username) {
            const fetchUserData = async () => {
                try {
                    // Fetch additional user data from API
                    let response = await fetch(`${baseUrl}/partner-users/sub/${authUser.sub}`);

                    // Create user via API if not exists
                    if (response.status === 404) {
                        const createResponse = await fetch(
                            `${baseUrl}/partner-users`,
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    cognitoSub: authUser.sub,
                                    username: authUser.username,
                                    email: authUser.email,
                                    givenName: authUser.givenName,
                                    familyName: authUser.familyName,
                                }),
                                headers: { "Content-Type": "application/json" },
                            });
                        response = await fetch(`${baseUrl}/partner-users/sub/${authUser.sub}`);
                    }

                    if (!response.ok) {
                        throw new Error("Failed to fetch user data");
                    }

                    const result = await response.json();
                    setPartnerUser(result);
                    router.push("/partner/events")
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

            setIsLoading(true);
            fetchUserData();
            return;
        }

        setPartnerUser(null);
    }, [authUser]);

    return (
        <Box sx={{ textAlign: "center", p: { xs: 2, md: 4 } }}>
            {authUser ? (
                <>
                    <Typography variant="h3">
                        {authUser.givenName} {authUser.familyName}
                    </Typography>
                    <Typography variant="h5">{partnerUser?.company?.companyName ?? ""}</Typography>
                    {!(partnerUser?.company?.companyName && partnerUser?.company?.address?.streetAddress) && (
                        <>
                            {
                                isLoading ? (
                                    <Box sx={{ width: '100%' }}>
                                        <CircularProgress size={16} color="secondary" />
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        color: theme.palette.customColors.blue.main,
                                        mt: 2,
                                        mb: 2,
                                    }}>
                                        Bitte vervollständigen Sie das&nbsp;
                                        <Link
                                            component="button"
                                            onClick={() => setIsOverlayOpen(true)}
                                            sx={{
                                                fontWeight: 'bold',
                                                color: theme.palette.customColors.blue.main
                                            }}
                                        >
                                            {' '}Profil Ihres Unternehmens.
                                        </Link>
                                    </Typography>
                                )
                            }
                        </>
                    )}
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
                confirmForm ?
                    <ConfirmSignup email={username} /> :
                    <>
                        <Typography variant="h6" align="center" sx={{ mb: 6 }}>
                            Partner Login
                        </Typography>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <TextField
                            label="Email-Adresse"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Passwort"
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
                            sx={{ mt: 2, fontSize: '12px' }}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        <Box>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Sie haben noch kein Konto?
                                {' '}
                                <Link
                                    href="/partner/register"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: theme.palette.customColors.blue.main
                                    }}
                                >
                                    Registrieren
                                </Link>
                            </Typography>
                        </Box>
                    </>
            )}
        </Box>
    );
};

export default PartnerLoginForm;