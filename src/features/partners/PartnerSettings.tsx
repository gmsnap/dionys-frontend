import PartnerContentLayout from "@/layouts/PartnerContentLayout";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    useTheme,
    ListItemButton,
    Link
} from "@mui/material";
import { useState } from "react";
import PartnerUserEditForm from "./PartnerUserEditForm";
import PartnerCompanyForm from "./PartnerCompanyForm";
import PartnerTeamList from "./PartnerTeamList";
import { ArrowRight } from "lucide-react";

const PartnerSettings: React.FC = () => {
    const theme = useTheme();

    const [selectedItem, setSelectedItem] = useState(0);

    const menuItems = [
        "Persönliche Informationen",
        "Unternehmen",
        "Team",
        "Zahlungsoptionen",
        "Lizenz"
    ];

    const content = [
        <PartnerUserEditForm key="profile" />,
        <PartnerCompanyForm key="company" />,
        <PartnerTeamList key="team" />,
        <Typography key="billing" variant="body1">
            <Link
                href="/payments"
                target="_blank"
                sx={{
                    fontWeight: "bold",
                    color: theme.palette.customColors.blue.main,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                }}
            >
                Zahlung
                <ArrowRight size={16} color={theme.palette.customColors.blue.main} />
            </Link>
        </Typography>,
        <Typography key="licence" variant="body1">Lizentinformationen:</Typography>,
    ];

    return (
        <PartnerContentLayout title={"Allgemeine Einstellungen"}>
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
        </PartnerContentLayout>
    );
};

export default PartnerSettings;
