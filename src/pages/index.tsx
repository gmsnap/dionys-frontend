import { ReactElement } from 'react';
import Layout from '../layouts/ClientLayout';
import type { NextPageWithLayout } from '../types/page';
import { Box, Button, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';

const Home: NextPageWithLayout = () => {

  return (
    <Box pt={3} className="gradient-background" sx={{ height: '100vh' }}>
      <Typography variant="h2" textAlign="center" sx={{ mt: 4 }}>Home (tbd)</Typography>

      <Box textAlign={'center'} mt={10} display={'flex'} flexDirection={'column'}>

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
          Locations finden<ArrowRight />
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
          Partner-Login <ArrowRight />
        </Button>

        <Button
          href='/admin'
          sx={{
            color: 'secondary.main',
            fontFamily: "'Gugi', sans-serif",
            fontSize: '20px',
            fontWeight: 400,
            letterSpacing: '-0.07em',
            m: 2,
          }}
        >
          Dionys-Admin <ArrowRight />
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
