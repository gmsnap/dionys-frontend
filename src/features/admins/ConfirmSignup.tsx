import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Grid2 } from '@mui/material';
import { useAuthContext } from '@/auth/AuthContext';

interface ConfirmSignupInputs {
    email: string;
    verificationCode: string;
}

const ConfirmSignup: React.FC = () => {
    const { confirmSignUp2 } = useAuthContext();
    const { control, handleSubmit, formState: { errors } } = useForm<ConfirmSignupInputs>();
    const [message, setMessage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const onSubmit = async (data: ConfirmSignupInputs) => {
        setIsLoading(true);
        setMessage(null);

        try {
            await confirmSignUp2(data.email, data.verificationCode);
            setMessage('Sign-up successfully confirmed! You can now log in.');
        } catch (error: any) {
            console.error('Error confirming sign-up:', error);
            setMessage(error.message || 'Failed to confirm sign-up. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', my: 'auto', px: 2 }}>
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                Bestätigen Sie die Anmeldung
            </Typography>
            <Typography variant="body1" sx={{ mb: 6 }}>
                Wir haben einen Bestätigungscode an Ihre E-Mail-Adresse geschickt.<br />
                Bitte geben Sie hier Ihre E-Mail-Adresse und den Code ein.<br />
                Überprüfen Sie auch Ihren Spam-Ordner
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body1" textAlign="left">Email Adresse</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Email ist erforderlich', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } }}
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

                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body1" textAlign="left">Verification Code</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="verificationCode"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Verification Code ist erforderlich' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.verificationCode}
                                    helperText={errors.verificationCode?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isLoading}
                            sx={{ mt: 2, fontSize: '12px' }}
                        >
                            {isLoading ? 'Wird überprüft...' : 'Abschicken'}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {message && (
                <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
                    {message}
                </Alert>
            )}
        </Box>
    );
};

export default ConfirmSignup;