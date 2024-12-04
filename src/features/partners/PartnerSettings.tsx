import PartnerContentLayout from "@/layouts/PartnerContentLayout";
import theme from "@/theme";
import { Box, Typography, List, ListItem, ListItemText, Theme, useTheme, ListItemButton } from "@mui/material";
import { useState } from "react";
import PartnerUserEditForm from "./PartnerUserEditForm";

const PartnerSettings: React.FC = () => {
    const theme = useTheme();

    const [selectedItem, setSelectedItem] = useState(0);

    const menuItems = ["Persönliche Informationen", "Zahlungsoptionen", "Lizenz"];

    const content = [
        <PartnerUserEditForm key="profile" />,
        <Typography key="billing" variant="body1">Billing details and payment methods content goes here.</Typography>,
        <Typography key="licence" variant="body1">License goes here.</Typography>,
    ];

    return (
        <PartnerContentLayout title={"Allgemeine Einstellungen"}>
            <Box display="flex" height="100%">
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
                                    borderRadius: '4px',
                                    color: selectedItem === index
                                        ? theme.palette.customColors.pink.light
                                        : 'primary',
                                    backgroundColor: 'transparent !important',
                                    "&:hover": {
                                        color: theme.palette.customColors.pink.light,
                                    },
                                    cursor: "pointer",
                                }}
                            >
                                <ListItemText primary={item} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Right Content */}
                <Box
                    flex="1"
                    sx={{
                        mt: 4,
                        ml: 8,
                    }}
                >
                    {content[selectedItem]}
                </Box>
            </Box>
        </PartnerContentLayout>
    );
};

export default PartnerSettings;
