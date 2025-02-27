import type { ReactElement } from "react"
import Layout from "../layouts/ClientLayout"
import type { NextPageWithLayout } from "../types/page"
import { Box, Button, Link, Typography } from "@mui/material"
import Image from "next/image"
import theme from "@/theme"

const Home: NextPageWithLayout = () => {
  return (
    <Box
      className="gradient-background"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "200px",
          mt: `${theme.layout.headerHeight}px`,
        }}
      >
        <Image src="/category-social.jpg" alt="Event locations header image" layout="fill" objectFit="cover" priority />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: "white",
              textAlign: "center",
              pl: "10%",
              pr: "10%",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "22px", sm: "unset" },
              }}
            >
              Digitale Event-Planung
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "22px", sm: "unset" },
              }}
            >
              mit Dionys
            </Typography>
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1, // Allow this box to grow and push the footer down
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 3,
          px: 2,
        }}
      >
        <Button href="/partner" variant="outlined" sx={{ mt: 2, minWidth: 180 }}>
          Location Login
        </Button>

        <Button href="/partner/register" variant="contained" sx={{ mt: 3, mb: 6, minWidth: 180 }}>
          Jetzt Registrieren
        </Button>

        <Box
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            textAlign: { xs: "left", sm: "center" },
            maxWidth: "620px",
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: { xs: "16px", sm: "24px", md: "32px" },
            }}
          >
            DIONYS ist das &ldquo;OpenTable f&uuml;r Events&rdquo;
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
              display: "block",
              mt: 3,
            }}
          >
            Wir ersetzen das Kontaktformular auf deiner Website und beantworten Eventanfragen automatisch. Spar dir die
            Zeit hunderte von Erstanfragen zu beantworten.
          </Typography>
          <Typography
            sx={{
              display: "block",
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
              mt: 3,
            }}
          >
            Du möchtest nicht mehr alle Event Anfragen selbst beantworten?
            <br />
            Kontaktiere{" "}
            <Link
              href="mailto:sales@dionys.ai"
              sx={{
                fontWeight: 700,
                color: "black",
              }}
            >
              sales@dionys.ai
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* Footer Section */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          mt: "auto", // Push the footer to the bottom
          backgroundColor: theme.palette.customColors.textBackground.halfdark,
          width: "100%",
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <Link href="/" sx={{ mx: 2, color: "inherit", textDecoration: "none" }}>
            Impressum
          </Link>
          <Link href="/" sx={{ mx: 2, color: "inherit", textDecoration: "none" }}>
            Datenschutz
          </Link>
          <Link href="/" sx={{ mx: 2, color: "inherit", textDecoration: "none" }}>
            AGB
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

// Use ClientLayout as the layout for this page
Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default Home
