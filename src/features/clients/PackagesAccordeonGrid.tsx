import React, { } from 'react';
import { Grid2, SxProps, Theme } from '@mui/material';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';
import { formatPriceWithType } from '@/utils/formatPrice';
import { HandCoins, Package } from 'lucide-react';
import { formatPackageCategory } from '@/utils/formatPackageCategories';
import theme from '@/theme';

interface Props {
    sx?: SxProps<Theme>;
}

const PackagesAccordeonGrid = ({ sx }: Props) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();

    const setPackageId = (packageId: number) => {
        if (eventConfiguration) {
            setEventConfiguration({
                ...eventConfiguration,
                packageId,
            });
        }
    };

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    return (
        <Grid2 container spacing={5} sx={{ ...sx }}>
            {location?.eventPackages &&
                location.eventPackages.map((p) => (
                    <Grid2 key={p.id} size={{ xs: 12 }}>
                        <AccordionGridItem
                            id={p.id}
                            image={p.images.length > 0 ? p.images[0] as string : ""}
                            isSelected={eventConfiguration?.packageId === p.id}
                            selectRequested={(id) => setPackageId(id)}
                            title={p.title}
                            subTitle={`${formatPriceWithType(p.price, p.priceType)}`}
                            information={p.description}
                            infoItems={[
                                {
                                    icon: <Package color={iconColor} />,
                                    label: formatPackageCategory(p.packageCategory)
                                },
                                {
                                    icon: <HandCoins color={iconColor} />,
                                    label: formatPriceWithType(p.price, p.priceType)
                                },
                            ]}
                        />
                    </Grid2>
                ))}
        </Grid2 >
    );
};

export default PackagesAccordeonGrid;