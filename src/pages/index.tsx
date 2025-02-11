import { ReactElement } from 'react';
import Layout from '../layouts/ClientLayout';
import type { NextPageWithLayout } from '../types/page';
import { Box, Button, Link, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
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
        backgroundColor: theme.palette.customColors.blue.main,
      }}>
        <Image
          src="/category-social.jpg"
          alt="Event locations header image"
          layout="fill"
          objectFit="cover"
          priority
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <Typography variant="h1" sx={{
            color: 'white',
            textAlign: 'center',
            pl: '10%',
            pr: '10%',
          }}>
            <Typography sx={{
              fontSize: { xs: '22px', sm: 'unset' },
            }}>
              Digitale Event-Planung
            </Typography>
            <Typography sx={{
              fontSize: { xs: '22px', sm: 'unset' },
            }}>
              mit Dionys
            </Typography>
          </Typography>
        </Box>
      </Box>

      <Box textAlign={'center'} mt={'200px'} display={'flex'} flexDirection={'column'}>

        {/*<Button
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
        </Button> */}

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

        <Button
          href="/partner/register"
          variant="contained"
          sx={{
            mt: 2,
            mr: 'auto',
            mb: 6,
            ml: 'auto',
            pl: 6,
            pr: 6,
          }}
        >
          Jetzt Registrieren
        </Button>

        <Typography
          sx={{
            textAlign: { xs: 'left', sm: 'center' },
            maxWidth: '620px',
            mr: 'auto',
            ml: 'auto',
          }}>
          <Typography
            component="span"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '16px', sm: '24px', md: '32px' },
            }}
          >
            DIONYS ist das &ldquo;OpenTable f&uuml;r Events&rdquo;
          </Typography>
          <Typography component="span" sx={{ display: 'block', marginTop: 1 }}>
            Wir ersetzen das Kontaktformular auf deiner Website und beantworten Eventanfragen automatisch.
            Spar dir die Zeit hunderte von Erstanfragen zu beantworten.
          </Typography>
          <Typography component="span" sx={{ display: 'block', fontSize: 'small', marginTop: 1 }}>
            Bei Interesse kontaktiere {' '}
            <Link
              href="mailto:sales@dionys.ai"
              sx={{
                fontWeight: 700,
                color: 'black',
              }}
            >
              sales@dionys.ai
            </Link>
          </Typography>
        </Typography>

      </Box>
    </Box>
  );
};

// Use ClientLayout as the layout for this page
Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
