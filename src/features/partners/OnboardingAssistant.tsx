import type React from "react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Box, Button, List, ListItem, ListItemButton, ListItemText, SxProps, Theme, Typography, useMediaQuery, useTheme } from "@mui/material"
import useStore from "@/stores/partnerStore"
import PartnerCompanyForm from "./PartnerCompanyForm"
import CreateLocationForm from "./CreateLocationForm"
import RoomForm from "./RoomForm"
import { CircleCheck } from "lucide-react"
import { companyCompleted, locationCompleted, roomsCompleted } from "@/services/onboardingService"
import { fetchEventPackagesByCompany } from "@/services/eventPackageService"
import { EventPackageModel } from "@/models/EventPackageModel"
import EventPackageForm from "./EventPackageForm"
import { PackageCategories } from "@/constants/PackageCategories"
import LocationEmbedCode from "./LocationEmbedCode"
import { useAuthContext } from "@/auth/AuthContext"
import { fetchLocationById, storePartnerLocations } from "@/services/locationService"
import { useHeaderContext } from "@/components/headers/PartnerHeaderContext"

// Define a type for our menu items
interface MenuItem {
    label: string
    content: ReactNode
    completed: boolean
}

interface StepNextButtonProps {
    title?: string;
    disabled?: boolean
    callback: () => void;
}

const StepNextButton = ({ title, disabled, callback }: StepNextButtonProps) => {
    return (
        <Button
            variant="contained"
            color="primary"
            disabled={disabled || false}
            onClick={(e) => { e.preventDefault(); callback(); }}
            sx={{
                lineHeight: 0,
                outline: '3px solid transparent',
                width: { xs: '100%', sm: '84%' },
                mt: 3,
                mb: 3,
                '&:hover': {
                    outline: '3px solid #00000033',
                },
                '.icon': {
                    color: '#ffffff',
                },
                '&:hover .icon': {
                    color: '#ffffff',
                },
            }}
        >
            {title || 'Weiter'}
        </Button>
    );
}

interface OnboardingAssistantProps {
    sx?: SxProps<Theme>;
}

const OnboardingAssistant = ({ sx }: OnboardingAssistantProps) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    const { authUser } = useAuthContext();
    const { partnerUser, partnerLocations } = useStore()
    const { setIsOnboardingOverlayOpen } = useHeaderContext();

    const [companyId, setCompanyId] = useState<number | null>(null)
    const [locationId, setLocationId] = useState<number | null>(null)
    const [locationCompletedState, setLocationCompletedState] = useState(0);
    const [idCode, setIdCode] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<number>(0)
    const [roomCompleted, setRoomCompleted] = useState(0);
    const [foodPackages, setFoodPackages] = useState<EventPackageModel[] | null>(null);
    const [foodCompleted, setFoodCompleted] = useState(0);
    const [lookPackages, setLookPackages] = useState<EventPackageModel[] | null>(null);
    const [lookCompleted, setLookCompleted] = useState(0);
    const [selectedItem, setSelectedItem] = useState(0)

    const scrollableBoxRef = useRef<HTMLDivElement>(null);

    // Create a state for the menu items and content
    const [menuData, setMenuData] = useState<MenuItem[]>([])

    const nextStep = () => {
        const firstItemIndex = menuData.findIndex(item => !item.completed);
        if (firstItemIndex !== -1) {
            setSelectedItem(firstItemIndex);
        }
    }

    const scrollToTop = () => {
        if (scrollableBoxRef.current) {
            scrollableBoxRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }
    }

    const fetchEventPackages = async (companyId: number) => {
        const fetchedPackages = await fetchEventPackagesByCompany(companyId) as EventPackageModel[] | null
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

    const fetchLocationEmbedCode = async (locationId: number) => {
        if (!authUser) {
            return;
        }

        try {
            // Fetch Locations
            const locationData =
                await fetchLocationById(
                    locationId,
                    true,
                    null,
                    null,
                    authUser.idToken
                );

            if (!locationData) {
                return;
            }
            if (!locationData.billingAddress) {
                locationData.billingAddress = null;
            }

            setIdCode(locationData.idCode);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        nextStep();
    }, [menuData])

    // Initialize the menu data
    useEffect(() => {
        const items = [];

        if (!partnerUser) {
            //TODO: set error info
            return;
        }

        if (!companyCompleted(partnerUser)) {
            items.push(
                {
                    label: "Unternehmen",
                    content: <PartnerCompanyForm
                        key="company"
                        submitButtonCaption="Weiter"
                        onComplete={nextStep}
                    />,
                    completed: false,
                }
            );
        } else {
            items.push(
                {
                    label: "Unternehmen",
                    content: null,
                    completed: true,
                }
            );
        }

        // Location
        if (!partnerLocations || !locationCompleted(partnerLocations) || locationCompletedState != 2) {
            if (locationCompletedState == 0) {
                setLocationCompletedState(1);
            }
            items.push(
                {
                    label: "Location",
                    content: (
                        <Box sx={{ mr: 2 }}>
                            <Typography variant="h3" sx={{ textAlign: 'left', mb: 3 }}>
                                Location hinzufügen
                            </Typography>
                            <CreateLocationForm
                                key="location"
                                locationId={0}
                                locationCreated={setLocationId}
                            />,
                            <StepNextButton
                                disabled={!locationId || locationId < 1}
                                callback={() => { setLocationCompletedState(2) }}
                            />
                        </Box>
                    ),
                    completed: false,
                }
            );
        } else {
            items.push(
                {
                    label: "Location",
                    content: null,
                    completed: true,
                }
            );
        }

        // Room
        if (roomCompleted < 2 && !roomsCompleted(partnerLocations)) {
            items.push(
                {
                    label: "Rooms & Tables",
                    content: (
                        <Box sx={{ mr: 2 }}>
                            <Typography variant="h3" sx={{ textAlign: 'left', mb: 3 }}>
                                Raum / Table hinzufügen
                            </Typography>
                            <RoomForm
                                key="room"
                                roomId={roomId}
                                locationId={locationId}
                                companyId={companyId ?? 0}
                                submitButtonCaption="Raum speichern"
                                roomCreated={setRoomId}
                                imagesChanged={(images) => setRoomCompleted(images && images.length > 0 ? 1 : 0)}
                                sx={{ height: '100%' }}
                            />
                            <StepNextButton
                                disabled={roomCompleted < 1}
                                callback={() => { setRoomCompleted(2) }}
                            />
                        </Box>
                    ),
                    completed: false,
                }
            );
        } else {
            items.push(
                {
                    label: "Rooms & Tables",
                    content: null,
                    completed: true,
                }
            );
        }

        if (!foodPackages || foodPackages.length == 0) {
            items.push(
                {
                    label: "Food & Beverage",
                    content: (
                        <Box sx={{ mr: 2 }}>
                            <Typography variant="h3" sx={{ textAlign: 'left', mb: 3 }}>
                                Food & Beverage Paket hinzufügen
                            </Typography>
                            <EventPackageForm
                                key={"p1"}
                                packageId={0}
                                locationId={locationId}
                                companyId={partnerUser.companyId}
                                submitButtonCaption="Paket speichern"
                                created={(id: number) => {
                                    //
                                }}
                                packageCategory={"catering" as PackageCategories}
                                sx={{ height: '100%' }}
                            />
                            <StepNextButton
                                title={foodCompleted == 0 ? 'Überspringen' : 'Weiter'}
                                disabled={foodCompleted == 1}
                                callback={() => { setFoodCompleted(2) }}
                            />
                        </Box>
                    ),
                    completed: foodCompleted == 2,
                }
            );
        } else {
            items.push(
                {
                    label: "Food & Beverage",
                    content: null,
                    completed: foodCompleted == 2,
                }
            );
        }

        if (!lookPackages || lookPackages.length == 0) {
            items.push(
                {
                    label: "Look & Feel",
                    content: (
                        <Box sx={{ mr: 2 }}>
                            <Typography variant="h3" sx={{ textAlign: 'left', mb: 3 }}>
                                Look & Feel Paket hinzufügen
                            </Typography>
                            <EventPackageForm
                                key={"p2"}
                                packageId={0}
                                locationId={locationId}
                                companyId={partnerUser.companyId}
                                submitButtonCaption="Paket speichern"
                                created={(id: number) => {
                                    //
                                }}
                                packageCategory={"equipment" as PackageCategories}
                                sx={{ height: '100%' }}
                            />
                            <StepNextButton
                                title={lookCompleted == 0 ? 'Überspringen' : 'Weiter'}
                                disabled={lookCompleted == 1}
                                callback={() => { setLookCompleted(2) }}
                            />
                        </Box>
                    ),
                    completed: lookCompleted == 2,
                },
            );
        } else {
            items.push(
                {
                    label: "Look & Feel",
                    content: null,
                    completed: lookCompleted == 2,
                }
            );
        }

        if (idCode) {
            items.push(
                {
                    label: "DIONYS einbetten",
                    content: (
                        <Box sx={{ mr: 2 }}>
                            <Typography variant="h3" sx={{ textAlign: 'left', mb: 3 }}>
                                DIONYS einbetten
                            </Typography>
                            <LocationEmbedCode idCode={idCode} sx={{ maxWidth: '84%' }} />
                            <StepNextButton
                                title={'Fertig'}
                                disabled={lookCompleted == 1}
                                callback={() => { setIsOnboardingOverlayOpen(false); }}
                            />
                        </Box>
                    ),
                    completed: false,
                },
            );
        } else {
            items.push(
                {
                    label: "DIONYS einbetten",
                    content: null,
                    completed: false,
                }
            );
        }

        setMenuData(items);
    }, [
        locationId,
        locationCompletedState,
        companyId,
        idCode,
        roomId,
        roomCompleted,
        foodPackages,
        foodCompleted,
        lookPackages,
        lookCompleted
    ])

    useEffect(() => {
        if (partnerUser?.companyId) {
            setCompanyId(partnerUser.companyId)
            fetchEventPackages(partnerUser.companyId);
            return
        }
        setCompanyId(null)
    }, [partnerUser])

    useEffect(() => {
        if (partnerLocations && partnerLocations.length > 0) {
            setLocationId(partnerLocations[0].id);
        }
    }, [partnerLocations])

    useEffect(() => {
        if (locationId && locationId > 0) {
            fetchLocationEmbedCode(locationId);
        }
    }, [locationId])

    useEffect(() => {
        if (locationId && locationId > 0 && roomCompleted == 2) {
            storePartnerLocations();
        }
    }, [roomCompleted])

    useEffect(() => {
        scrollToTop();
    }, [selectedItem]);

    // Ensure we don't try to access a non-existent item
    const safeSelectedItem = Math.min(selectedItem, menuData.length - 1)

    return (
        <Box sx={{ ...sx }}>
            {isMobile ? (
                // Mobile Layout
                <Box sx={{ width: "100%" }}>
                    <Box
                        ref={scrollableBoxRef}
                        sx={{
                            px: 1,
                            maxHeight: "calc(100vh - 250px)",
                            overflowY: "auto",
                        }}
                    >
                        {menuData[safeSelectedItem]?.content}
                    </Box>
                </Box>
            ) : (
                // Desktop Layout
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    {/* Left Menu */}
                    <List
                        sx={{
                            minWidth: "max-content",
                            borderRight: "1px solid #ddd",
                            pr: 6,
                        }}
                    >
                        {menuData.map((item, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    selected={safeSelectedItem === index}
                                    onClick={() => setSelectedItem(index)}
                                    disabled={item.content == null}
                                    sx={{
                                        color: theme.palette.customColors.blue.main,
                                        backgroundColor: "transparent !important",
                                        "&:hover": {
                                            color: theme.palette.customColors.blue.main,
                                        },
                                        cursor: "pointer",
                                    }}
                                >
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontWeight: safeSelectedItem === index ? 800 : 300,
                                            },
                                        }}
                                    />
                                    {item.completed &&
                                        <CircleCheck
                                            size={32}
                                            fill="green"
                                            stroke="white"
                                            strokeWidth={2}
                                            style={{ marginLeft: 10 }}
                                        />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    {/* Right Content */}
                    <Box
                        ref={scrollableBoxRef}
                        flex="1"
                        sx={{
                            mt: 2,
                            ml: 8,
                            maxHeight: "calc(100vh - 400px)",
                            overflowY: "auto", // Enable vertical scrolling
                        }}
                    >
                        {menuData[safeSelectedItem]?.content}
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default OnboardingAssistant

