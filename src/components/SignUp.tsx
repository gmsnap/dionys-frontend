import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Grid2, Link } from '@mui/material';
import { useAuthContext } from '@/auth/AuthContext'
import theme from '@/theme';

interface SignUpFormInputs {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
}

interface Props {
    onSuccess?: (usernmae: string, password: string) => void;
}

export const SignUp = ({ onSuccess }: Props) => {
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormInputs>();
    const [formError, setFormError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);
    const { signUp2 } = useAuthContext();

    const onSubmit = async (data: SignUpFormInputs) => {
        if (isSubmitting) return; // Prevent multiple submissions
        try {
            const result = await signUp2(
                data.email,
                data.password,
                data.givenName,
                data.familyName,
            );
            console.log('Signup result:', result);
            setSuccess(true);
            setFormError(null);
            onSuccess?.(data.email, data.password);
        } catch (err) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError("An unknown error occurred");
            }

            setSuccess(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, px: 2 }}>
            <Typography variant="h6" align="center" sx={{ mb: 6 }}>
                Jetzt registrieren
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body1">Email</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: 'Email ist erforderlich',
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Invalid email address'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body1">Password</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="password"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: 'Password ist erforderlich',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body1">Ihr Vorname</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="givenName"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Vorname ist erforderlich' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.givenName}
                                    helperText={errors.givenName?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body1">Ihr Name</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="familyName"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Familienname ist erforderlich' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.familyName}
                                    helperText={errors.familyName?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 11 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting || success}
                            sx={{ mt: 4 }}
                        >
                            {isSubmitting ? 'Konto erstellen...' : 'Konto erstellen'}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Partner-Registrierung erfolgreich!<br />
                    Wir haben einen Bestätigungscode an Ihre E-Mail-Adresse gesendet.<br />
                    Bitte{' '}
                    <Link
                        href="/partner"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.customColors.blue.main
                        }}
                    >melden Sie sich an</Link>{' '}
                    und geben Sie Ihren Verifizierungscode ein.
                </Alert>
            )}
        </Box>
    );
};