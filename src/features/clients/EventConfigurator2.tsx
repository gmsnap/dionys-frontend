import React, { useEffect, useRef, useState } from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import useStore, { createDefaultEventConfigurationModel } from '@/stores/eventStore';
import theme from '@/theme';
import CategorySelector from './CategorySelector';
import GeneralSelector from './GeneralSelector';
import VenueSelector from './VenueSelector';
import PackageSelector from './PackageSelector';
import PersonalDataSelector from './PersonalDataSelector';
import ProposalSummary from './ProposalSummary';
import CompanyDataSelector from './CompanyDataSelector';
import ProposalThanks from './ProposalThanks';
import { AvailablePackageCategories, PackageCategories } from '@/constants/PackageCategories';

interface EventConfiguratorProps {
    locationId: number;
    sx?: SxProps<Theme>;
}

/* 
 * Proposal Generator Component
*/
const EventConfigurator2 = ({ locationId, sx, }: EventConfiguratorProps) => {
    const { location, eventConfiguration, setEventConfiguration } = useStore();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollableBoxRef = useRef<HTMLDivElement>(null);

    const handleNavClick = (index: number) => {
        if (index <= selectedIndex) {
            setSelectedIndex(index);
        }
    };

    const scrollToTop = () => {
        if (scrollableBoxRef.current) {
            scrollableBoxRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }

    const prevStep = () => {
        setSelectedIndex(selectedIndex - 1);
    };

    const nextStep = () => {
        setSelectedIndex(selectedIndex + 1);
    };

    const navItems = [
        {
            label: 'Anlass', id: 'category',
            control: <CategorySelector stepCompleted={nextStep} />
        },
        {
            label: 'Allgemeines', id: 'general',
            control: <GeneralSelector
                previousStep={prevStep}
                stepCompleted={nextStep} />
        },
        {
            label: 'Venue', id: 'venue',
            control: <VenueSelector
                previousStep={prevStep}
                stepCompleted={nextStep} />
        },
    ];

    // Conditionally add Catering PackageSelector
    if (location?.eventPackages &&
        location.eventPackages
            .filter((p) => p.packageCategory === AvailablePackageCategories[0] as PackageCategories)
            .length > 0) {
        navItems.push(
            {
                label: 'Catering', id: 'catering',
                control: <PackageSelector
                    previousStep={prevStep}
                    stepCompleted={nextStep}
                    packageCategory={
                        AvailablePackageCategories[0] as PackageCategories
                    }
                />
            }
        );
    }

    // Conditionally add Equipment PackageSelector
    if (location?.eventPackages &&
        location.eventPackages
            .filter((p) => p.packageCategory === AvailablePackageCategories[1] as PackageCategories)
            .length > 0) {
        navItems.push(
            {
                label: 'Packages', id: 'packages',
                control: <PackageSelector
                    previousStep={prevStep}
                    stepCompleted={nextStep}
                    packageCategory={
                        AvailablePackageCategories[1] as PackageCategories
                    }
                />
            }
        );
    }

    // Add remaining items
    navItems.push(
        {
            label: 'PersonalData', id: 'personalData',
            control: <PersonalDataSelector
                previousStep={prevStep}
                stepCompleted={nextStep} />
        },
        {
            label: 'CompanyData', id: 'company',
            control: <CompanyDataSelector
                previousStep={prevStep}
                stepCompleted={nextStep} />
        },
        {
            label: 'Summary', id: 'summary',
            control: <ProposalSummary
                previousStep={prevStep}
                proposalSent={nextStep} />
        },
        {
            label: 'Thanks', id: 'thanks',
            control: <ProposalThanks />
        }
    );

    useEffect(() => {
        if (!locationId) {
            return;
        }
        if (!eventConfiguration) {
            setEventConfiguration(createDefaultEventConfigurationModel(locationId));
        }
    }, [eventConfiguration, locationId]);

    useEffect(() => {
        scrollToTop();
    }, [selectedIndex]);

    if (!location) {
        return (
            <Typography>No Location</Typography>
        );
    }

    return (
        <Box sx={{
            ...sx,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100vh',
        }}>
            {/* Title Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: theme.palette.customColors.textBackround.darker,
                    gap: 1,
                    pt: 2,
                    pb: 2,
                }}
            >
                <Typography variant='h3'>{location.title}</Typography>
                <Typography variant='h5'>{location.city}</Typography>
            </Box>

            {/* Headlines */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 1,
                    pt: 2, pr: 8, pb: 0, pl: 8,
                }}
            >
                <Typography variant='h4' sx={{ fontSize: '26px', fontWeight: 700 }}>
                    {selectedIndex == navItems.length - 1
                        ? 'Your Summary'
                        : 'Create my event'}
                </Typography>
                <Typography variant='body1' sx={{ fontSize: '12px' }}>
                    Select your event and receive a proposal in 2 minutes
                </Typography>
            </Box>

            {/* Navigation Bar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 2,
                    mb: 2,
                    opacity: selectedIndex < navItems.length - 1
                        ? 1
                        : 0.2,
                    pointerEvents: selectedIndex < navItems.length - 1
                        ? 'auto'
                        : 'none',
                }}
            >
                {navItems.map((item, index) => (
                    <Box
                        key={item.id}
                        onClick={() => handleNavClick(index)}
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            minWidth: '20px',
                            height: '13px',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: '3px',
                                backgroundColor: index <= selectedIndex
                                    ? theme.palette.customColors.blue.main
                                    : theme.palette.customColors.text.inactive,
                            }}
                        >

                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Selected Control */}
            <Box
                ref={scrollableBoxRef}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'top',
                    width: { xs: '100%' },
                    maxWidth: '600px',
                    height: 'calc(100% - 200px)',
                    overflow: 'auto',
                    scrollbarColor: '#888 transparent',
                    scrollbarWidth: 'thin', // For Firefox
                    '&::-webkit-scrollbar': {
                        width: '6px', // Slim scrollbar
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    margin: '0 auto',
                }}
            >
                {navItems[selectedIndex].control}
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    flexGrow: 1,
                    backgroundColor: theme.palette.customColors.textBackround.darker,
                }}
            >
            </Box>
        </Box>
    );
};

export default EventConfigurator2;