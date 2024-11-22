import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Container } from "@mui/material";
import theme from "@/theme";
import { NextPageWithLayout } from "@/types/page";
import ClientLayout from "@/layouts/ClientLayout";

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <ClientLayout>{page}</ClientLayout>);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        {getLayout(<Component {...pageProps} />)}
      </Box>
    </ThemeProvider>
  );
}
