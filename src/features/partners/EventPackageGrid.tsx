import React, { } from 'react';
import { Box, SxProps, Theme, Grid2, Button } from '@mui/material';
import GridItem from '@/components/GridItem';
import { formatPrice, formatPriceWithType, translatePrice } from '@/utils/formatPrice';
import { Pencil, User, X } from 'lucide-react';
import GridAddItem from '@/components/GridAddItem';
import { EventPackageModel } from '@/models/EventPackageModel';
import { PriceTypes } from '@/constants/PriceTypes';
import { handleDeleteEventPackage } from '@/services/eventPackageService';
import theme from '@/theme';

interface EventPackageGridProps {
    sx?: SxProps<Theme>;
    eventPackages: EventPackageModel[];
    addButton: boolean;
    selectHandler?: (id: number) => void;
    eventPackagesChanged?: () => void;
}

const EventPackageGrid = ({ sx, eventPackages, addButton = true, selectHandler, eventPackagesChanged }: EventPackageGridProps) => {
    return (
        <Grid2 container spacing={5} alignItems="stretch" sx={{ ...sx }}>
            {eventPackages.map((p) => (
                <Grid2 key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}>
                    <GridItem
                        id={p.id}
                        image={p.images[0]}
                        title={p.title}
                        priceTag={formatPriceWithType(p.price, p.priceType as PriceTypes)}
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
                                variant="outlined"
                                color="primary"
                                sx={{
                                    flex: 1,
                                    '&:hover': {
                                        borderColor: '#000000',
                                        backgroundColor: '#000000',
                                        color: '#ffffff',
                                    },
                                    '.icon': {
                                        color: '#000000',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                    lineHeight: 0,
                                }}
                                onClick={() => { selectHandler?.(p.id); }}
                            >
                                Bearbeiten
                                <Box
                                    component="span" sx={{ ml: 1, }}
                                >
                                    <Pencil className="icon" width={12} height={12} />
                                </Box>
                            </Button>,
                            <Button
                                key={`${p.id}-2`}
                                variant="outlined"
                                sx={{
                                    flex: 1,
                                    color: '#ff0000',
                                    borderColor: '#ff0000',
                                    '&:hover': {
                                        borderColor: '#ff0000',
                                        backgroundColor: '#ff0000',
                                        color: '#ffffff',
                                    },
                                    '.icon': {
                                        color: '#ff0000',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                    lineHeight: 0,
                                }}
                                onClick={
                                    () => handleDeleteEventPackage(p.id, () => eventPackagesChanged?.())
                                }
                            >
                                Löschen
                                <Box component="span" sx={{ ml: 1 }}>
                                    <X className="icon" width={16} height={16} />
                                </Box>
                            </Button>,
                        ]}
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