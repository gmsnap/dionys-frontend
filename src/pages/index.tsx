import { ReactElement } from 'react';
import Layout from '../layouts/ClientLayout';
import type { NextPageWithLayout } from '../types/page';
import LocationGrid from '@/features/clients/LocationGrid';
import { Box, Typography } from '@mui/material';

const Home: NextPageWithLayout = () => {

  return (
    <Box pt={3} className="gradient-background" sx={{ height: '100vh' }}>
      <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>Eventlocations</Typography>
      <LocationGrid sx={{ height: '100%' }} />
    </Box>
  );
};

// Use ClientLayout as the layout for this page
Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
