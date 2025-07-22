import React, { } from 'react';
import { Box, SxProps, Theme, Grid2, Button } from '@mui/material';
import GridItem from '@/components/GridItem';
import { Pencil, User, X } from 'lucide-react';
import GridAddItem from '@/components/GridAddItem';
import { EventPackageModel } from '@/models/EventPackageModel';
import { handleDeleteEventPackage } from '@/services/eventPackageService';
import theme from '@/theme';
import { useAuthContext } from '@/auth/AuthContext';
import { FormatPrice, PriceTypes } from '@/utils/pricingManager';

interface EventPackageGridProps {
    sx?: SxProps<Theme>;
    eventPackages: EventPackageModel[];
    addButton: boolean;
    selectHandler?: (id: number) => void;
    eventPackagesChanged?: () => void;
}

const EventPackageGrid = ({ sx, eventPackages, addButton = true, selectHandler, eventPackagesChanged }: EventPackageGridProps) => {
    const { authUser } = useAuthContext();

    return (
        <Grid2 container spacing={5} alignItems="stretch" sx={{ ...sx }}>
            {eventPackages.map((p) => (
                <Grid2 key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                    <GridItem
                        id={p.id}
                        image={p.images[0]}
                        title={p.title}
                        priceTag={FormatPrice.formatPriceWithType({
                            price: p.price,
                            priceType: p.priceType as PriceTypes,
                            pricingLabel: p.pricingLabel,
                            short: true
                        })}
                        listItems={[
                            ...(p.minPersons != null || p.maxPersons != null
                                ? [{
                                    icon: <User color={theme.palette.customColors.blue.main} />,
                                    label: `${p.minPersons ?? ''}-${p.maxPersons ?? ''}`
                                }]
                                : [])
                        ]}
                        buttons={[
                            <Button
                                key={`${p.id}-1`}
                                variant="edit"
                                onClick={() => { selectHandler?.(p.id); }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: {
                                            xs: 'inline',
                                            sm: 'none',
                                            lg: 'inline',
                                        },
                                    }}
                                >
                                    Bearbeiten
                                </Box>
                                <Box
                                    component="span" sx={{ ml: 1, }}
                                >
                                    <Pencil className="icon" width={12} height={12} />
                                </Box>
                            </Button>,
                            <Button
                                key={`${p.id}-2`}
                                variant="delete"
                                onClick={
                                    () => handleDeleteEventPackage(
                                        authUser?.idToken ?? "",
                                        p.id,
                                        () => eventPackagesChanged?.()
                                    )
                                }
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: {
                                            xs: 'inline',
                                            sm: 'none',
                                            lg: 'inline',
                                        },
                                    }}
                                >
                                    Löschen
                                </Box>
                                <Box component="span" sx={{ ml: 1 }}>
                                    <X className="icon" width={16} height={16} />
                                </Box>
                            </Button>,
                        ]}
                        onImageClick={() => { selectHandler?.(p.id); }}
                    />
                </Grid2>
            ))}
            {addButton &&
                <Grid2 key={-1} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} display="flex">
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <GridAddItem
                            id={-1}
                            handler={() => { selectHandler?.(0); }}
                            sx={{ flex: 1, height: '100%' }}
                        />
                    </Box>
                </Grid2>}
        </Grid2>
    );
};

export default EventPackageGrid;