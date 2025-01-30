import { ReactElement } from 'react';
import Layout from '../layouts/ClientLayout';
import type { NextPageWithLayout } from '../types/page';
import { Box, Button, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import theme from '@/theme';

const Home: NextPageWithLayout = () => {

  return (
    <Box pt={3} className="gradient-background" sx={{ height: '100vh' }}>

      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.customColors.pink.dark,
      }}>
        <Typography variant="h1" sx={{
          color: 'white',
          textAlign: 'center',
        }}>
          Finden Sie die besten Event-Locations
        </Typography>
      </Box>

      <Box textAlign={'center'} mt={'200px'} display={'flex'} flexDirection={'column'}>

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
          Location finden<ArrowRight />
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
          Location Login<ArrowRight />
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
