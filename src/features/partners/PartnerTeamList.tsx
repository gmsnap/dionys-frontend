import { fetchPartnersByCompany } from "@/services/partnerService";
import { Box, Button, Grid2, List, ListItem, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material";
import { UserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import useStore from "@/stores/partnerStore";
import { PartnerUserModel } from "@/models/PartnerUserModel";
import theme from "@/theme";

const PartnerTeamList: React.FC = () => {
    const { partnerUser } = useStore();

    const [users, setUsers] = useState<PartnerUserModel[] | null>(null);
    const [invite, setInvite] = useState(false);
    const [formData, setFormData] = useState({ email: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInvite(false);
    }

    useEffect(() => {
        if (partnerUser?.companyId) {
            const fetchPartners = async (companyId: number) => {
                const response = await fetchPartnersByCompany(companyId, null, null);
                if (!response || !response.response.ok) {
                    console.log(
                        `Error ${response?.response.status}: ${response?.response.statusText}`
                    );
                    return;
                }

                setUsers(response.result);
            };

            fetchPartners(partnerUser.companyId);
        }
    }, [partnerUser]);

    if (invite === true) {
        return (
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    {/* Email */}
                    <Grid2 size={{ xs: 12 }}>
                        <Grid2 container alignItems="center">
                            <Grid2 size={{ xs: 4, md: 2 }}>
                                <Typography>Email</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 8, md: 6 }}>
                                <TextField
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                            mt: 2,
                        }}
                    >
                        Einladung senden
                    </Button>
                </Grid2>
            </form>
        );
    }

    return (
        <List>
            {users && partnerUser &&
                users.map((user, index) => (
                    <ListItem key={index}>
                        <ListItemIcon>
                            <UserRound />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Typography>{user.givenName + " " + user.familyName}</Typography>
                                    {partnerUser.id === user.id &&
                                        <Typography sx={{
                                            backgroundColor: theme.palette.customColors.pink.main,
                                            color: theme.palette.primary.contrastText,
                                            fontFamily: "'Nunito', sans-serif",
                                            fontSize: '12px',
                                            borderRadius: '8px',
                                            pl: 1,
                                            pr: 1,
                                            ml: 1,
                                        }}>Sie</Typography>
                                    }
                                </Box>
                            }
                            secondary={user.email}
                        />
                    </ListItem>
                ))}
            <Button
                variant="contained"
                color="primary"
                onClick={() => setInvite(true)}
                sx={{
                    mt: 2,
                    ml: 2,
                }}
            >
                Teammitglied einladen
            </Button>
        </List>
    );
};

export default PartnerTeamList;