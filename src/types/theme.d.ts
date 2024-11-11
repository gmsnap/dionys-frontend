// types/theme.d.ts
import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
        layout: {
            headerHeight: number;
        };
    }

    // allow configuration using `createTheme`
    interface ThemeOptions {
        layout?: {
            headerHeight?: number;
        };
    }
}
