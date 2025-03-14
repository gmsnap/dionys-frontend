import type React from "react"
import { useEffect, useState, type ReactNode } from "react"
import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material"
import useStore from "@/stores/partnerStore"
import PartnerCompanyForm from "./PartnerCompanyForm"
import CreateLocationForm from "./CreateLocationForm"
import RoomForm from "./RoomForm"
import PackagesPageContent from "./PackagesPageContent"
import { Check, X } from "lucide-react"

// Define a type for our menu items
interface MenuItem {
    label: string
    content: ReactNode
}

const OnboardingAssistant = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    const { partnerUser, partnerLocations } = useStore()

    const [companyId, setCompanyId] = useState<number | null>(null)
    const [locationId, setLocationId] = useState<number | null>(null)
    const [roomId, setRoomId] = useState<number | null>(null)

    const [selectedItem, setSelectedItem] = useState(0)

    // Create a state for the menu items and content
    const [menuData, setMenuData] = useState<MenuItem[]>([])

    // Initialize the menu data
    useEffect(() => {
        const items = [];

        if (!partnerUser) {
            //TODO: set error info
            return;
        }

        if (!partnerUser.company || !(
            partnerUser.company.companyName &&
            partnerUser.company.address?.streetAddress &&
            partnerUser.company.address?.city &&
            partnerUser.company.address?.postalCode
        )) {
            items.push(
                {
                    label: "Unternehmen",
                    content: <PartnerCompanyForm key="company" />,
                }
            );
        } else {
            items.push(
                {
                    label: "Unternehmen",
                    content: null,
                }
            );
        }

        // Location
        if (!partnerLocations || partnerLocations.length == 0) {
            items.push(
                {
                    label: "Location",
                    content: <CreateLocationForm key="location" locationId={0} locationCreated={setLocationId} />,
                }
            );
        } else {
            items.push(
                {
                    label: "Location",
                    content: null,
                }
            );
        }

        // Room
        if (true) {
            items.push(
                {
                    label: "Rooms & Tables",
                    content: (
                        <RoomForm key="room" roomId={0} locationId={locationId} companyId={companyId ?? 0} roomCreated={setRoomId} />
                    ),
                }
            );
        }

        items.push(
            {
                label: "Food & Beverage",
                content: <PackagesPageContent locationId={locationId} packageCategory={"catering"} />,
            },
            {
                label: "Look & Feel",
                content: <PackagesPageContent locationId={locationId} packageCategory={"equipment"} />,
            },
        );

        setMenuData(items);

        const firstItemIndex = items.findIndex(item => item.content !== null);
        if (firstItemIndex !== -1) {
            setSelectedItem(firstItemIndex);
        }
    }, [locationId, partnerLocations, companyId])

    // Mobile tabs handler
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedItem(newValue)
    }

    useEffect(() => {
        if (partnerUser?.companyId) {
            setCompanyId(partnerUser.companyId)
            return
        }
        setCompanyId(null)
    }, [partnerUser])

    // Ensure we don't try to access a non-existent item
    const safeSelectedItem = Math.min(selectedItem, menuData.length - 1)

    return (
        <Box
            sx={
                {
                    // Your existing styles
                }
            }
        >
            {isMobile ? (
                // Mobile Layout
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 5 }}>
                        <Tabs
                            value={safeSelectedItem}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="settings navigation tabs"
                            sx={{
                                "& .MuiTab-root": {
                                    color: theme.palette.customColors.text.tertiary,
                                    "&.Mui-selected": {
                                        color: theme.palette.customColors.blue.main,
                                        fontWeight: 800,
                                    },
                                },
                            }}
                        >
                            {menuData.map((item, index) => (
                                <Tab key={index} label={item.label} />
                            ))}
                        </Tabs>
                    </Box>
                    <Box
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
                                    {!item.content &&
                                        <Check color={theme.palette.customColors.blue.main} />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    {/* Right Content */}
                    <Box
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

