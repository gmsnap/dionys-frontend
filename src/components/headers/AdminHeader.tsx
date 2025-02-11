import theme from '@/theme';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import router from 'next/router';
import { FC } from 'react';

const Header: FC = () => {
    return (
        <AppBar
            position="fixed"
            sx={{ backgroundColor: '#ffffff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontFamily: "'Gugi', sans-serif",
                        fontSize: '40px',
                        background: theme.palette.customColors.blue.main,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingX: '40px',
                        paddingY: '20px',
                        userSelect: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => router.push('/')}
                >
                    DIONYS
                </Typography>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontFamily: "'Gugi', sans-serif",
                        fontSize: '20px',
                        background: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingX: '40px',
                        paddingY: '20px',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    Admin Dashboard
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;