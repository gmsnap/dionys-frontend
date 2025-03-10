import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Grid2, Link } from '@mui/material';
import { useAuthContext } from '@/auth/AuthContext'
import theme from '@/theme';

interface Props {
    email: string;
}

interface FormInputs {
    code: string;
    password: string;
}

const RecoveryCodeForm = ({ email }: Props) => {
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormInputs>();
    const [formError, setFormError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);
    const { confirmPassword } = useAuthContext();

    const onSubmit = async (data: FormInputs) => {
        if (isSubmitting) return; // Prevent multiple submissions
        try {
            await confirmPassword(email, data.code, data.password);
            setSuccess(true);
            setFormError(null);
        } catch (err) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError("An unknown error occurred");
            }

            setSuccess(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
                <Typography variant="h6" align="center" sx={{ mb: 6 }}>
                    Passwort erfolgreich geändert
                </Typography>
                <Alert severity="success" sx={{ mt: 2 }}>
                    Dein Passwort wurde erfolgreich geändert.<br />
                    Bitte{' '}
                    <Link
                        href="/partner"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.customColors.blue.main
                        }}
                    >melden dich an</Link>{' '}.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
            <Typography variant="h6" align="center" sx={{ mb: 6 }}>
                Bestätigungscode eingeben
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
                Bitte gib den Bestätigungscode ein, den wir an deine E-Mail-Adresse<br />
                <strong>{email}</strong><br />
                gesendet haben.
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <Typography variant="body1">Bestätigungscode</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 8 }}>
                        <Controller
                            name="code"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: 'Code ist erforderlich',
                                maxLength: 6,
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.code}
                                    helperText={errors.code?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <Typography variant="body1">Password</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 8 }}>
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

                    <Grid2 size={{ xs: 12, }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting || success}
                            sx={{ mt: 4 }}
                        >
                            {isSubmitting ? 'Weiter...' : 'Weiter...'}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </Box>
    );
};

export default RecoveryCodeForm;