import { AppBar, Toolbar, Typography, Box, useTheme, Button } from '@mui/material';
import { FC } from 'react';
import MenuItem from '../MenuItem';
import useStore from '@/stores/eventStore';
import Link from 'next/link';

const Header: FC = () => {
    const theme = useTheme();
    const { eventConfiguration } = useStore();

    return (
        <AppBar
            position="fixed"
            sx={{ backgroundColor: '#ffffff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Toolbar sx={{
                display: 'flex',
                justifyContent: 'space-between',
                height: `${theme.layout.headerHeight}px`,
            }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontFamily: "'Gugi', sans-serif",
                        fontSize: '40px',
                        background: 'linear-gradient(90deg, #DE33C4 0%, #781C6A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingX: '40px',
                        paddingY: '20px',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    DIONYS
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {eventConfiguration?.locationId ?
                        <Button
                            variant="outlined"
                            color="secondary"
                            component={Link}
                            href={`/configurator/${eventConfiguration.locationId}`}
                            sx={{ fontSize: '20px' }}
                        >
                            Konfigurator
                        </Button> :
                        null}
                    <MenuItem href="/">Home</MenuItem>
                    <MenuItem href="/locations">Locations</MenuItem>
                    <MenuItem href="/configurator">Services</MenuItem>
                    <MenuItem href="/about">Über Uns</MenuItem>
                    <MenuItem href="/contact">Kontakt</MenuItem>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;