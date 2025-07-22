import PartnerContentLayout from "@/layouts/PartnerContentLayout";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    useTheme,
    ListItemButton,
    useMediaQuery,
    Tabs,
    Tab
} from "@mui/material";
import { useState } from "react";
import PartnerUserEditForm from "./PartnerUserEditForm";
import PartnerCompanyForm from "./PartnerCompanyForm";
import PartnerTeamList from "./PartnerTeamList";
import PaymentComponent from "./PaymentComponent";

const PartnerSettings: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [selectedItem, setSelectedItem] = useState(1);

    const menuItems = [
        isMobile ? "Profil" : "Persönliche Informationen",
        "Unternehmen",
        "Team",
        "Zahlungsoptionen",
    ];

    const content = [
        <PartnerUserEditForm key="profile" />,
        <PartnerCompanyForm key="company" />,
        <PartnerTeamList key="team" />,
        <PaymentComponent key="payment" />,
    ];

    // Mobile tabs handler
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedItem(newValue);
    };

    return (
        <PartnerContentLayout title={"Allgemeine Einstellungen"}>
            {isMobile ? (
                // Mobile Layout
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
                        <Tabs
                            value={selectedItem}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="settings navigation tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    color: theme.palette.customColors.text.tertiary,
                                    '&.Mui-selected': {
                                        color: theme.palette.customColors.blue.main,
                                        fontWeight: 800,
                                    },
                                }
                            }}
                        >
                            {menuItems.map((item, index) => (
                                <Tab key={index} label={item} />
                            ))}
                        </Tabs>
                    </Box>
                    <Box sx={{
                        px: 1,
                        maxHeight: 'calc(100vh - 250px)',
                        overflowY: 'auto'
                    }}>
                        {content[selectedItem]}
                    </Box>
                </Box>
            ) : (
                // Desktop Layout
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                    {/* Left Menu */}
                    <List
                        sx={{
                            minWidth: 'max-content',
                            borderRight: '1px solid #ddd',
                            pr: 6,
                        }}
                    >
                        {menuItems.map((item, index) => (
                            <ListItem
                                key={index}
                                disablePadding>
                                <ListItemButton
                                    selected={selectedItem === index}
                                    onClick={() => setSelectedItem(index)}
                                    sx={{
                                        color: selectedItem === index
                                            ? theme.palette.customColors.blue.main
                                            : theme.palette.customColors.text.tertiary,
                                        backgroundColor: 'transparent !important',
                                        "&:hover": {
                                            color: theme.palette.customColors.blue.main,
                                        },
                                        cursor: "pointer",
                                    }}
                                >
                                    <ListItemText
                                        primary={item}
                                        primaryTypographyProps={{
                                            sx: {
                                                fontWeight: selectedItem === index
                                                    ? 800
                                                    : 100,
                                            }
                                        }}
                                    />
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
                            maxHeight: 'calc(100vh - 400px)',
                            overflowY: 'auto', // Enable vertical scrolling
                        }}
                    >
                        {content[selectedItem]}
                    </Box>
                </Box>
            )}
        </PartnerContentLayout>
    );
};

export default PartnerSettings;