import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Grid2, Link } from '@mui/material';
import { useAuthContext } from '@/auth/AuthContext';
import theme from '@/theme';

interface ConfirmSignupProps {
    email: string | null;
}

interface ConfirmSignupInputs {
    email: string;
    verificationCode: string;
}

const ConfirmSignup: React.FC<ConfirmSignupProps> = ({ email }) => {
    const { confirmSignUp2 } = useAuthContext();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ConfirmSignupInputs>({
        defaultValues: {
            email: email || '',
            verificationCode: '',
        },
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [failed, setFailed] = React.useState(false);

    const onSubmit = async (data: ConfirmSignupInputs) => {
        setIsLoading(true);
        setSuccess(false);
        setFailed(false);

        try {
            await confirmSignUp2(data.email, data.verificationCode);
            setSuccess(true);
        } catch (error) {
            setFailed(true);
            console.error('Error confirming sign-up:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', my: 'auto', px: 2 }}>
            <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                Bestätigen Sie die Anmeldung
            </Typography>
            <Typography variant="body2" sx={{ mb: 6 }}>
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
                            rules={{
                                required: 'Email ist erforderlich',
                                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
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

                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body1" textAlign="left">Bestätigungscode</Typography>
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
                            disabled={isLoading || success}
                            sx={{ mt: 2, fontSize: '12px' }}
                        >
                            {isLoading ? 'Wird überprüft...' : 'Abschicken'}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {success && (
                <Alert severity={'success'} sx={{ mt: 2, textAlign: 'left' }}>
                    Anmeldung erfolgreich! Sie können sich jetzt{' '}
                    <Link
                        href="/partner"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.customColors.blue.main
                        }}
                    > einloggen</Link>.
                </Alert>
            )}
            {failed && (
                <Alert severity={'error'} sx={{ mt: 2, textAlign: 'left' }}>
                    Die Anmeldung konnte nicht bestätigt werden.<br />Bitte versuchen Sie es erneut.
                </Alert>
            )}
        </Box>
    );
};

export default ConfirmSignup;