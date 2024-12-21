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
    company: string;
}

export const SignUp: React.FC = () => {
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
                data.company,
            );
            console.log('Signup result:', result);
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

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, px: 2 }}>
            <Typography variant="h6" align="center" sx={{ mb: 6 }}>
                Sign Up new Partner
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
                                required: 'Email is required',
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
                                required: 'Password is required',
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
                        <Typography variant="body1">Given Name</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="givenName"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Given Name is required' }}
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
                        <Typography variant="body1">Family Name</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="familyName"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Family Name is required' }}
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

                    <Grid2 size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body1">Company Name</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 8 }}>
                        <Controller
                            name="company"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Company Name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.company}
                                    helperText={errors.company?.message}
                                />
                            )}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting || success}
                            sx={{ mt: 2 }}
                        >
                            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Partner Registration successful!<br />
                    We have sent a verification code to the email address.<br />
                    Partner can now{' '}
                    <Link
                        href="/partner"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.customColors.pink.dark
                        }}
                    >log in</Link>{' '}
                    with the verification code.
                </Alert>
            )}
        </Box>
    );
};