import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
        layout: {
            headerHeight: number;
        };
    }

    // Allow configuration using `createTheme`
    interface ThemeOptions {
        layout?: {
            headerHeight?: number;
        };
    }
}
