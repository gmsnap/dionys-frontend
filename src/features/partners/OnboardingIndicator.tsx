import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Circle, CircleCheck } from "lucide-react";
import useStore from "@/stores/partnerStore";
import { companyCompleted, locationCompleted, roomsCompleted } from "@/services/onboardingService";
import { fetchEventPackagesByCompany } from "@/services/eventPackageService";
import { EventPackageModel } from "@/models/EventPackageModel";

interface MenuItem {
    label: string;
    ok: boolean;
}

interface OnboardingIndicatorProps {
    sx?: object;
    onClick?: (index: number) => void;
}

const OnboardingIndicator = ({ sx, onClick }: OnboardingIndicatorProps) => {
    const { partnerUser, partnerLocations } = useStore();
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [foodPackages, setFoodPackages] = useState<EventPackageModel[] | null>(null);
    const [lookPackages, setLookPackages] = useState<EventPackageModel[] | null>(null);

    const fetchEventPackages = async (companyId: number) => {
        const fetchedPackages =
            await fetchEventPackagesByCompany(companyId) as EventPackageModel[] | null;

        setFoodPackages(
            fetchedPackages?.filter((p: EventPackageModel) => {
                return p.packageCategory === "catering";
            }) || []
        );

        setLookPackages(
            fetchedPackages?.filter((p: EventPackageModel) => {
                return p.packageCategory === "equipment";
            }) || []
        );
    }

    useEffect(() => {
        if (!partnerUser) return;

        const items = [
            { label: "Registrierung", ok: true },
            { label: "Unternehmen", ok: companyCompleted(partnerUser) },
            { label: "Location", ok: locationCompleted(partnerLocations) },
            { label: "Rooms & Tables", ok: roomsCompleted(partnerLocations) },
            { label: "Food & Beverage", ok: foodPackages != null && foodPackages.length > 0 },
            { label: "Look & Feel", ok: lookPackages != null && lookPackages.length > 0 },
            { label: "DIONYS auf die eigene Homepage kopieren", ok: false },
        ];
        setMenuData(items);
    }, [partnerUser, partnerLocations, foodPackages, lookPackages]);

    useEffect(() => {
        if (partnerUser?.companyId && partnerUser.companyId > 0) {
            fetchEventPackages(partnerUser.companyId);
        }
    }, [partnerUser]);

    return (
        <Box
            sx={{
                ...sx,
                display: "flex",
                flexDirection: "column",
                alignItems: "start"
            }}
        >
            {menuData.map((item, index) => (
                <Box
                    key={index}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                        minHeight: 46,
                        cursor: menuData[index].ok ? 'auto' : 'pointer',
                    }}
                    onClick={menuData[index].ok ? undefined : () => onClick?.(index - 1)}
                >
                    {/* Vertical line */}
                    {index > 0 && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: -10,
                                left: 14,
                                height: 16,
                                borderColor: menuData[index - 1].ok ? "#ccc" : "#ccc",
                                borderStyle: menuData[index - 1].ok ? "solid" : "dashed",
                                borderWidth: '2px'
                            }}
                        />
                    )}
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            marginRight: 2,
                            zIndex: 2,
                        }}
                    >
                        {item.ok ? (
                            <CircleCheck size={32} fill="green" stroke="white" strokeWidth={2} />
                        ) : (
                            <Circle size={30} color="#ccc" strokeWidth={2} strokeDasharray="3 3" style={{ marginLeft: 1 }} />
                        )}
                    </Box>
                    {/* Label */}
                    <Typography>{item.label}</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default OnboardingIndicator;
