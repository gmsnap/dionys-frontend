import { ReactElement } from 'react';
import Layout from '../layouts/ClientLayout';
import type { NextPageWithLayout } from '../types/page';
import { Box, Button, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';

const Home: NextPageWithLayout = () => {

  return (
    <Box pt={3} className="gradient-background" sx={{ height: '100vh' }}>
      <Typography variant="h2" textAlign="center" sx={{ mb: 4 }}>Home</Typography>
      <Box textAlign={'center'} mt={10}>
        <Button
          href='/locations'
          sx={{
            color: 'secondary.main',
            fontFamily: "'Gugi', sans-serif",
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '-0.07em',
            m: 2,
          }}
        >
          Locations <ArrowRight />
        </Button>
        <Button
          href='/partner'
          sx={{
            color: 'secondary.main',
            fontFamily: "'Gugi', sans-serif",
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '-0.07em',
            m: 2,
          }}
        >
          Partner <ArrowRight />
        </Button>
      </Box>
    </Box>
  );
};

// Use ClientLayout as the layout for this page
Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
