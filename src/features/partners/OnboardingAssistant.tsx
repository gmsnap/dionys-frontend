import type React from "react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import {
    Box,
    Button,
    Fade,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Modal,
    SxProps,
    Theme,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material"
import useStore from "@/stores/partnerStore"
import PartnerCompanyForm from "./PartnerCompanyForm"
import CreateLocationForm from "./CreateLocationForm"
import RoomForm from "./RoomForm"
import { CircleCheck, CircleCheckBig, X } from "lucide-react"
import { companyCompleted, roomsCompleted } from "@/services/onboardingService"
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
    disabled?: boolean;
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

interface ModelProperties {
    content: ReactNode;
    onClose: () => void;
}

interface OnboardingAssistantProps {
    sx?: SxProps<Theme>;
}

const OnboardingAssistant = ({ sx }: OnboardingAssistantProps) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    const { authUser } = useAuthContext();
    const { partnerUser, partnerLocations } = useStore()
    const { isOnboardingOverlayOpen, setIsOnboardingOverlayOpen } = useHeaderContext();

    const [companyId, setCompanyId] = useState<number | null>(null)
    const [locationId, setLocationId] = useState<number | null>(null)
    const [locationCompletedState, setLocationCompletedState] = useState(0);
    const [idCode, setIdCode] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<number>(0)
    const [roomCompleted, setRoomCompleted] = useState(0);
    const [foodPackages, setFoodPackages] = useState<EventPackageModel[] | null>(null);
    const [foodPackageId, setFoodPackageId] = useState<number>(0);
    const [foodCompleted, setFoodCompleted] = useState<number>(0);
    const [lookPackages, setLookPackages] = useState<EventPackageModel[] | null>(null);
    const [lookPackageId, setLookPackageId] = useState<number>(0);
    const [lookCompleted, setLookCompleted] = useState(0);
    const [selectedItem, setSelectedItem] = useState(0);
    const [userSelect, setUserSelect] = useState(false);
    const [modalContent, setModalContent] = useState<ModelProperties | null>(null);

    const scrollableBoxRef = useRef<HTMLDivElement>(null);

    // Create a state for the menu items and content
    const [menuData, setMenuData] = useState<MenuItem[]>([])

    const nextStep = () => {
        if (selectedItem == 0 &&
            (isOnboardingOverlayOpen != null && isOnboardingOverlayOpen > 0)) {
            if (menuData[isOnboardingOverlayOpen]?.completed === false) {
                setSelectedItem(isOnboardingOverlayOpen);
                return;
            }
        }

        if (!userSelect) {
            return;
        }

        const nextItemIndex =
            menuData.findIndex((item, index) => !item.completed && index >= selectedItem);
        if (nextItemIndex !== -1) {
            setSelectedItem(nextItemIndex);
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

    const handleLocationCompleted = () => {
        setUserSelect(true);
        setModalContent({
            content: (
                <>
                    <Typography variant="h5" sx={{ mt: 10, textAlign: 'center' }}>
                        Location erfolgreich erstellt! <br />
                        <span role="img" aria-label="party">🎉</span>
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{ mt: 5 }}
                        onClick={() => {
                            setLocationCompletedState(2);
                            setModalContent(null);
                        }}
                    >
                        Jetzt Raum erstellen
                    </Button>
                </>
            ),
            onClose: () => {
                setLocationCompletedState(2);
                setModalContent(null);
            }
        });
    }

    const handleRoomCompleted = () => {
        setUserSelect(true);
        setModalContent({
            content: (
                <>
                    <Typography variant="h5" sx={{ mt: 10, textAlign: 'center' }}>
                        Raum erfolgreich erstellt! <br />
                        <span role="img" aria-label="party">🎉</span>
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{ mt: 5 }}
                        onClick={() => {
                            setRoomCompleted(2);
                            setModalContent(null);
                        }}
                    >
                        Jetzt Pakete erstellen
                    </Button>
                </>
            ),
            onClose: () => {
                setRoomCompleted(2);
                setModalContent(null);
            }
        });
    }

    const handleCodeCompleted = () => {
        setUserSelect(true);
        setModalContent({
            content: (
                <>
                    <Typography variant="h5" sx={{ mt: 10, textAlign: 'center' }}>
                        Geschafft! <br /> Ab jetzt beantworten wir deine Event Anfragen! <br />
                        <span role="img" aria-label="party">🎉</span>
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{ mt: 5 }}
                        onClick={() => { setIsOnboardingOverlayOpen(null); }}
                    >
                        Zur Startseite
                    </Button>
                </>
            ),
            onClose: () => { setIsOnboardingOverlayOpen(null); }
        });
    }

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
                        onComplete={() => { setUserSelect(true); nextStep(); }}
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
        if (locationCompletedState == 1) {
            items.push(
                {
                    label: "Location",
                    content: (
                        <Box sx={{ mr: 2, position: 'relative' }}>
                            <Typography variant="h3" sx={{ textAlign: 'left', mb: 3 }}>
                                Location hinzufügen
                            </Typography>
                            <CreateLocationForm
                                key="location"
                                locationId={0}
                                locationCreated={setLocationId}
                            />
                            <StepNextButton
                                disabled={!locationId || locationId < 1}
                                callback={handleLocationCompleted}
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
                                callback={handleRoomCompleted}
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

        if (foodCompleted == 0 && (!foodPackages || foodPackages.length == 0) || foodCompleted != 3) {
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
                                packageId={foodPackageId}
                                locationId={locationId}
                                companyId={partnerUser.companyId}
                                submitButtonCaption="Paket speichern"
                                created={(id: number) => { setFoodCompleted(1); setFoodPackageId(id); }}
                                imagesChanged={(images) => {
                                    const hasImages = images && images.length > 0;
                                    if (foodCompleted == 1 && hasImages) {
                                        setFoodCompleted(2);
                                        return;
                                    }
                                    if (foodCompleted == 2 && !hasImages) {
                                        setFoodCompleted(1);
                                        return;
                                    }
                                }}
                                packageCategory={"catering" as PackageCategories}
                                sx={{ height: '100%' }}
                            />
                            <StepNextButton
                                title={foodCompleted == 0 ? 'Überspringen' : 'Weiter'}
                                disabled={foodCompleted == 1}
                                callback={() => {
                                    setUserSelect(true);
                                    setFoodCompleted(3);
                                }}
                            />
                        </Box>
                    ),
                    completed: foodCompleted == 3,
                }
            );
        } else {
            items.push(
                {
                    label: "Food & Beverage",
                    content: null,
                    completed: true,
                }
            );
        }

        if (lookCompleted == 0 && (!lookPackages || lookPackages.length == 0) || lookCompleted != 3) {
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
                                packageId={lookPackageId}
                                locationId={locationId}
                                companyId={partnerUser.companyId}
                                submitButtonCaption="Paket speichern"
                                created={(id: number) => { setLookCompleted(1); setLookPackageId(id); }}
                                imagesChanged={(images) => {
                                    const hasImages = images && images.length > 0;
                                    if (lookCompleted == 1 && hasImages) {
                                        setLookCompleted(2);
                                        return;
                                    }
                                    if (lookCompleted == 2 && !hasImages) {
                                        setLookCompleted(1);
                                        return;
                                    }
                                }}
                                packageCategory={"equipment" as PackageCategories}
                                sx={{ height: '100%' }}
                            />
                            <StepNextButton
                                title={lookCompleted == 0 ? 'Überspringen' : 'Weiter'}
                                disabled={lookCompleted == 1}
                                callback={() => {
                                    setUserSelect(true);
                                    setLookCompleted(3);
                                }}
                            />
                        </Box>
                    ),
                    completed: lookCompleted == 3,
                },
            );
        } else {
            items.push(
                {
                    label: "Look & Feel",
                    content: null,
                    completed: true,
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
                            <LocationEmbedCode idCode={idCode} sx={{ maxWidth: { xs: '100%', sm: '84%' } }} />
                            <StepNextButton
                                title={'Fertig'}
                                disabled={lookCompleted == 1}
                                callback={handleCodeCompleted}
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
            const firstId = partnerLocations[0].id;
            if (firstId > 0) {
                setLocationId(firstId);
                if (locationCompletedState == 0) {
                    setLocationCompletedState(2);
                }
                return;
            }
        }
        setLocationCompletedState(1);
    }, [partnerLocations])

    useEffect(() => {
        if (locationId === null) {
            return;
        }
        if (locationId > 0) {
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
            <Modal open={modalContent != null}>
                <Fade in={modalContent != null}>
                    <Box
                        sx={{
                            position: "absolute",
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: isMobile ? "100%" : "50%",
                            height: isMobile ? "100%" : "50%",
                            maxHeight: isMobile ? "100%" : "80vh",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: isMobile ? 0 : 2,
                            overflow: "auto",
                        }}
                    >
                        {/* Close button - only visible on mobile */}
                        {isMobile && (
                            <IconButton
                                onClick={modalContent?.onClose}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    zIndex: 1,
                                }}
                            >
                                <X />
                            </IconButton>
                        )}

                        <CircleCheckBig size={120} color='#002A58' />

                        {modalContent?.content}
                    </Box>
                </Fade>
            </Modal>
        </Box>
    )
}

export default OnboardingAssistant;

