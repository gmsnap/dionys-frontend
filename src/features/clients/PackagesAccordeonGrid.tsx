import React from 'react';
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

    const togglePackage = (packageId: number, quantity?: number) => {
        if (eventConfiguration) {
            const currentPackageIds = eventConfiguration.packageIds || [];
            const existingPackage = currentPackageIds.find(p => p.id === packageId);
            let updatedPackageIds;

            if (existingPackage) {
                if (quantity === existingPackage.quantity) {
                    // Remove if already selected with the same quantity
                    updatedPackageIds = currentPackageIds.filter(p => p.id !== packageId);
                } else {
                    // Update quantity, ensuring it's defined
                    updatedPackageIds = currentPackageIds.map(p => {
                        if (p.id === packageId) {
                            return { ...p, quantity: quantity ?? 1 }; // Use provided quantity or default to 1
                        }
                        return p;
                    });
                }
            } else {
                // Add with quantity (default to 1 if not provided)
                updatedPackageIds = [...currentPackageIds, { id: packageId, quantity: quantity ?? 1 }];
            }

            const packageIdSet = new Set(updatedPackageIds.map(p => p.id));
            const packages = location?.eventPackages?.filter(pkg => packageIdSet.has(pkg.id));

            setEventConfiguration({
                ...eventConfiguration,
                packageIds: updatedPackageIds.length > 0 ? updatedPackageIds : null,
                packages: packages || null,
            });
        }
    };

    const iconColor = theme.palette.customColors.embedded.text.tertiary;

    if (!(location?.eventPackages) ||
        location.eventPackages
            .filter((p) => !packageCategory || p.packageCategory === packageCategory)
            .length === 0) {
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
                        isSelected={eventConfiguration?.packageIds?.some(pkg => pkg.id === p.id)}
                        selectRequested={(id, quantity) => togglePackage(id, quantity)}
                        title={p.title}
                        subTitle={
                            FormatPrice.formatPriceWithType({
                                price: p.price,
                                priceType: p.priceType,
                                pricingLabel: p.pricingLabel,
                                context: "booker",
                                short: true,
                                noneLabelKey: "none",
                            })
                        }
                        information={p.description}
                        infoItems={[
                            {
                                icon: <Package color={iconColor} />,
                                label: formatPackageCategory(p.packageCategory),
                            },
                            {
                                icon: <HandCoins color={iconColor} />,
                                label: FormatPrice.formatPriceWithType({
                                    price: p.price,
                                    priceType: p.priceType,
                                    pricingLabel: p.pricingLabel,
                                    context: "booker",
                                    noneLabelKey: "none",
                                }),
                            },
                        ]}
                        maxQuantity={p.maxQuantity || undefined}
                    />
                </Grid2>
            ))}
        </Grid2>
    );
};

export default PackagesAccordeonGrid;