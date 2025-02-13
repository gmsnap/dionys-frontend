import React, { } from 'react';
import { Grid2, SxProps, Theme, Typography } from '@mui/material';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';
import { formatPriceWithType } from '@/utils/formatPrice';
import { HandCoins, Package } from 'lucide-react';
import { formatPackageCategory } from '@/utils/formatPackageCategories';
import theme from '@/theme';
import { PackageCategories } from '@/constants/PackageCategories';

interface Props {
    packageCategory?: PackageCategories,
    sx?: SxProps<Theme>;
}

const PackagesAccordeonGrid = ({ packageCategory, sx }: Props) => {
    const { eventConfiguration, location, setEventConfiguration } = useStore();

    const togglePackage = (packageId: number) => {
        if (eventConfiguration) {
            const currentPackageIds = eventConfiguration.packageIds || [];
            const updatedPackageIds = currentPackageIds.includes(packageId)
                ? currentPackageIds.filter(id => id !== packageId) // Remove if already selected
                : [...currentPackageIds, packageId]; // Add if not selected
            const packageIdSet = new Set(updatedPackageIds);
            const packages = location?.eventPackages?.filter(room => packageIdSet.has(room.id));

            setEventConfiguration({
                ...eventConfiguration,
                packageIds: updatedPackageIds,
                packages: packages || null,
            });
        }
    };

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    if (!(location?.eventPackages) ||
        location.eventPackages
            .filter((p) => !packageCategory || p.packageCategory === packageCategory)
            .length == 0) {
        return (
            <Typography sx={{ textAlign: 'center' }}>
                Keine Event-Pakete verfügbar
            </Typography>
        );
    }

    return (
        <Grid2 container spacing={1} sx={{ ...sx }}>
            {location.eventPackages
                .filter((p) => !packageCategory || p.packageCategory === packageCategory)
                .map((p) => (
                    <Grid2 key={p.id} size={{ xs: 12 }}>
                        <AccordionGridItem
                            id={p.id}
                            images={p.images.length > 0
                                ? p.images
                                : [`/p-category-${p.packageCategory}.jpg`]}
                            isSelected={eventConfiguration?.packageIds?.includes(p.id)}
                            selectRequested={(id) => togglePackage(id)}
                            title={p.title}
                            subTitle={`${formatPriceWithType(p.price, p.priceType)}`}
                            information={p.description}
                            infoItems={[
                                {
                                    icon: <Package color={iconColor} />,
                                    label: formatPackageCategory(p.packageCategory),
                                },
                                {
                                    icon: <HandCoins color={iconColor} />,
                                    label: formatPriceWithType(p.price, p.priceType),
                                },
                            ]}
                        />
                    </Grid2>
                ))}
        </Grid2 >
    );
};

export default PackagesAccordeonGrid;