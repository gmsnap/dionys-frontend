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

    interface TypographyVariants {
        label: React.CSSProperties;
    }

    interface TypographyVariantsOptions {
        label?: React.CSSProperties;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
    }
}
