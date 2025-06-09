import React, { } from 'react';
import { Grid2, SxProps, Theme, Typography } from '@mui/material';
import AccordionGridItem from '@/components/AccordionGridItem';
import useStore from '@/stores/eventStore';
import { HandCoins, Package } from 'lucide-react';
import { formatPackageCategory } from '@/utils/formatPackageCategories';
import theme from '@/theme';
import { PackageCategories } from '@/constants/PackageCategories';
import { FormatPrice } from '@/utils/pricingManager';

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

    const filteredPackages = location.eventPackages.filter(
        (p) =>
            (!packageCategory || p.packageCategory === packageCategory) &&
            (!p.roomIds ||
                p.roomIds.length === 0 ||
                (eventConfiguration?.rooms &&
                    Array.isArray(p.roomIds) &&
                    eventConfiguration.rooms.some((room) => p.roomIds!.includes(room.id)))
            )
    );

    return (
        <Grid2 container spacing={1} sx={{ ...sx }}>
            {filteredPackages.map((p) => (
                <Grid2
                    key={p.id}
                    size={{
                        xs: 12,
                        sm: filteredPackages.length === 1 ? 12 : 6,
                        md: filteredPackages.length === 1
                            ? 12
                            : filteredPackages.length === 2 ? 6 : 4,
                    }}
                    sx={{ flexGrow: 1 }}
                >
                    <AccordionGridItem
                        id={p.id}
                        images={p.images.length > 0
                            ? p.images
                            : [`/p-category-${p.packageCategory}.jpg`]}
                        isSelected={eventConfiguration?.packageIds?.includes(p.id)}
                        selectRequested={(id) => togglePackage(id)}
                        title={p.title}
                        subTitle={
                            p.priceType === "none"
                                ? undefined
                                : `${FormatPrice.formatPriceWithType(p.price, p.priceType, p.pricingLabel)}`
                        }
                        information={p.description}
                        infoItems={[
                            {
                                icon: <Package color={iconColor} />,
                                label: formatPackageCategory(p.packageCategory),
                            },
                            {
                                icon: <HandCoins color={iconColor} />,
                                label: FormatPrice.formatPriceWithType(p.price, p.priceType, p.pricingLabel),
                            },
                        ]}
                    />
                </Grid2>
            ))}
        </Grid2>
    );
};

export default PackagesAccordeonGrid;