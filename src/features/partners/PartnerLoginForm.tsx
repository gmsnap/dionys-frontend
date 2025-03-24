"use client";

import React, { useState, useEffect } from "react";
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from "@mui/material";
import useStore from '@/stores/partnerStore';
import { useAuthContext } from '@/auth/AuthContext';
import ConfirmSignup from "../admins/ConfirmSignup";
import theme from "@/theme";
import { useHeaderContext } from "@/components/headers/PartnerHeaderContext";
import router from "next/router";
import { hasSubscription } from "@/services/paymentService";

interface Props {
    credentials?: { username: string, password: string };
}

const PartnerLoginForm = ({ credentials }: Props) => {
    const { authUser, login, logout } = useAuthContext();
    const { setIsOverlayOpen } = useHeaderContext();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmForm, setConfirmForm] = useState(false);
    const [error, setError] = useState("");

    const { partnerUser } = useStore();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const usr = credentials?.username ?? username;
            const pwd = credentials?.password ?? password;
            // Sign in with Amplify Auth
            const result = await login(usr, pwd);
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
        if (credentials) {
            handleLogin();
        }
    }, [credentials]);

    useEffect(() => {
        if (partnerUser && hasSubscription(partnerUser)) {
            router.push("/partner/events");
            return;
        }
    }, [partnerUser]);

    return (
        <Box sx={{ textAlign: "center", p: { xs: 2, md: 4 } }}>
            {authUser ? (
                <>
                    <Typography variant="h3">
                        {authUser.givenName} {authUser.familyName}
                    </Typography>
                    <Typography variant="h5">{partnerUser?.company?.companyName ?? ""}</Typography>
                    <Box sx={{ width: '100%' }}>
                        <CircularProgress size={16} color="secondary" />
                    </Box>
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
                    <ConfirmSignup
                        email={credentials?.username ?? username}
                        password={credentials?.password ?? password}
                    /> :
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLogin();
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Passwort"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLogin();
                            }}
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
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                <Link
                                    href="/partner/recovery"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: theme.palette.customColors.blue.main
                                    }}
                                >
                                    Passwort vergessen?
                                </Link>
                            </Typography>
                        </Box>
                    </>
            )}
        </Box>
    );
};

export default PartnerLoginForm;