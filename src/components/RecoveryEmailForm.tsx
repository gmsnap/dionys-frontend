import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Grid2, Link } from '@mui/material';
import { useAuthContext } from '@/auth/AuthContext'
import theme from '@/theme';

interface Props {
    onEmailSubmitted: (email: string) => void;
}

interface FormInputs {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
}

const RecoveryEmailForm = ({ onEmailSubmitted }: Props) => {
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormInputs>();
    const [formError, setFormError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);
    const { forgotPassword } = useAuthContext();

    const onSubmit = async (data: FormInputs) => {
        if (isSubmitting) return; // Prevent multiple submissions
        try {
            await forgotPassword(data.email);
            setSuccess(true);
            setFormError(null);
            onEmailSubmitted(data.email);
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
                Passwort zurücksetzen
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, }}>
                        <Typography variant="body1">Email</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, }}>
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
            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Wir haben einen Bestätigungscode an deine E-Mail-Adresse gesendet.<br />
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

export default RecoveryEmailForm;