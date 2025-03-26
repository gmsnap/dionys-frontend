import type React from "react"
import { type RoomPricingModel, createEmptyRoomPricingModel } from "@/models/RoomPricingModel"
import { createRoomPricing, deleteRoomPricing, fetchRoomPricingsByRoom } from "@/services/roomPricingService"
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
    IconButton,
    Paper,
    Grid2,
    InputAdornment,
} from "@mui/material"
import { Plus, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import theme from "@/theme"
import { useAuthContext } from "@/auth/AuthContext"
import { doPricingSlotsOverlap } from "@/utils/pricingManager"
import { WaitIcon } from "@/components/WaitIcon"

// German days of week
const germanDaysOfWeek = [
    { value: 0, label: "Montag" },
    { value: 1, label: "Dienstag" },
    { value: 2, label: "Mittwoch" },
    { value: 3, label: "Donnerstag" },
    { value: 4, label: "Freitag" },
    { value: 5, label: "Samstag" },
    { value: 6, label: "Sonntag" },
]

// Generate time options in 30 min steps
const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const hourStr = hour.toString().padStart(2, "0")
            const minuteStr = minute.toString().padStart(2, "0")
            options.push({
                value: `${hourStr}:${minuteStr}:00`,
                label: `${hourStr}:${minuteStr}`,
            })
        }
    }
    return options
}

const timeOptions = generateTimeOptions()

// Price type options
const priceTypeOptions = [
    { value: "hour", label: "Pro Stunde" },
    { value: "person", label: "Pro Person" },
]

interface Props {
    roomId?: number | null
}

// Function to format price for display
const formatPriceForDisplay = (value: number): string => {
    // Using comma as decimal separator for German formatting
    return value.toFixed(2).replace(".", ",")
}

const RoomPricings = ({ roomId }: Props) => {
    const { authUser } = useAuthContext()
    const [pricingId, setPricingId] = useState<number | null>(null)
    const [pricings, setPricings] = useState<RoomPricingModel[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [slotErrors, setSlotErrors] = useState<{ [key: number]: string | null }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // Track editing state for price fields
    const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null)
    const [editingPriceValue, setEditingPriceValue] = useState<string>("")
    const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set())

    const fetchPricings = async (roomId: number, selected: number | null | undefined = undefined) => {
        try {
            const fetchedPricings = await fetchRoomPricingsByRoom(roomId, setIsLoading, setError)
            setPricings(fetchedPricings || [])
            setError(null)
            if (selected !== undefined) {
                setPricingId(selected)
            }
        } catch (err) {
            setPricings([])
            setPricingId(null)
            setError("Error fetching Pricings")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!roomId) {
            return
        }
        fetchPricings(roomId)
    }, [roomId])

    const handleAddPricing = () => {
        if (!roomId) return;

        const newPricing = createEmptyRoomPricingModel(roomId);

        setPricings((prev) => {
            const newPricings = prev ? [...prev, newPricing] : [newPricing];

            // Reset errors (assuming an errors state exists)
            setSlotErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[newPricings.length - 1]; // Remove any errors for the new row
                return newErrors;
            });

            // Mark the new row as modified
            setModifiedRows((prev) => {
                const newSet = new Set(prev);
                newSet.add(newPricings.length - 1);
                return newSet;
            });

            return newPricings;
        });
    };

    const handlePricingChange = (index: number, field: keyof RoomPricingModel, value: any) => {
        if (!pricings) return
        const updatedPricings = [...pricings]
        updatedPricings[index] = {
            ...updatedPricings[index],
            [field]: value,
        }
        setPricings(updatedPricings)

        // Mark this row as modified
        setModifiedRows((prev) => {
            const newSet = new Set(prev)
            newSet.add(index)
            return newSet
        })
    }

    const deletePricing = async (id: number) => {
        if (!authUser?.idToken) {
            setError("Not authorized")
            return
        }
        await deleteRoomPricing(authUser.idToken, id, () => {
            console.log("deleted " + id)
        })
    }

    const handleDeletePricing = (index: number) => {
        if (!pricings) return

        const updatedPricings = [...pricings]
        const pricingToDelete = updatedPricings[index]
        updatedPricings.splice(index, 1)
        setPricings(updatedPricings)

        // Call delete on API
        if (pricingToDelete?.id) {
            deletePricing(pricingToDelete.id)
        }
    }

    const handleSavePricing = async (pricing: RoomPricingModel, index: number) => {
        if (!authUser?.idToken) {
            setError("Not authorized")
            return
        }

        // Verify pricing does not overlap with existing pricing
        if (Array.isArray(pricings) && pricings.length > 0) {
            if (pricings.some((p) => p.id != pricing.id && doPricingSlotsOverlap(p, pricing))) {
                setSlotErrors((prevErrors) => ({
                    ...prevErrors,
                    [index]: "Zeit-Slots dürfen sich nicht überlagern!",
                }));
                return;
            }
        }

        await createRoomPricing(
            authUser.idToken,
            pricing,
            (result) => {
                if (result.id) {
                    pricing.id = result.id;
                }
                // Remove from modified rows after successful save
                setModifiedRows((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(index)
                    return newSet
                });
                // Clear any existing errors for this row
                setSlotErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[index];
                    return newErrors;
                });
            },
            (errMsg) => {
                setSlotErrors((prevErrors) => ({
                    ...prevErrors,
                    [index]: errMsg ?? "Zeit-Slot konnte nicht gespeichert werden!",
                }));
            }
        );
    }

    // Handle price field focus
    const handlePriceFocus = (index: number) => {
        if (!pricings) return
        setEditingPriceIndex(index)
        setEditingPriceValue(formatPriceForDisplay(pricings[index].price))
    }

    // Handle price field change during editing
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and comma/dot for decimal
        const value = e.target.value.replace(/[^0-9,.]/g, "")
        setEditingPriceValue(value)
    }

    // Handle price field blur - convert to number and update state
    const handlePriceBlur = () => {
        if (editingPriceIndex === null || !pricings) return

        // Convert the edited value to a number
        let numericValue = 0
        try {
            // Replace comma with dot for parsing
            const normalizedValue = editingPriceValue.replace(",", ".")
            numericValue = Number.parseFloat(normalizedValue)
            if (isNaN(numericValue)) numericValue = 0
        } catch (e) {
            numericValue = 0
        }

        // Update the pricing with the new value
        handlePricingChange(editingPriceIndex, "price", numericValue)
        setEditingPriceIndex(null)
        setEditingPriceValue("")
    }

    if (isLoading) {
        return (<WaitIcon />)
    }

    if (error) {
        return <Typography color="error">{error}</Typography>
    }

    return (
        <Box sx={{ mt: 2 }}>
            {pricings &&
                pricings.map((pricing, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                        <Grid2 container spacing={2} alignItems="center">
                            {/* Day of week and time selectors */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Starttag</InputLabel>
                                    <Select
                                        value={pricing.startDayOfWeek}
                                        label="Starttag"
                                        onChange={(e) => handlePricingChange(index, "startDayOfWeek", e.target.value)}
                                    >
                                        {germanDaysOfWeek.map((day) => (
                                            <MenuItem key={`start-${day.value}`} value={day.value}>
                                                {day.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Startzeit</InputLabel>
                                    <Select
                                        value={pricing.startTime}
                                        label="Startzeit"
                                        onChange={(e) => handlePricingChange(index, "startTime", e.target.value)}
                                    >
                                        {timeOptions.map((time) => (
                                            <MenuItem key={`start-time-${time.value}`} value={time.value}>
                                                {time.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Endtag</InputLabel>
                                    <Select
                                        value={pricing.endDayOfWeek}
                                        label="Endtag"
                                        onChange={(e) => handlePricingChange(index, "endDayOfWeek", e.target.value)}
                                    >
                                        {germanDaysOfWeek.map((day) => (
                                            <MenuItem key={`end-${day.value}`} value={day.value}>
                                                {day.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Endzeit</InputLabel>
                                    <Select
                                        value={pricing.endTime}
                                        label="Endzeit"
                                        onChange={(e) => handlePricingChange(index, "endTime", e.target.value)}
                                    >
                                        {timeOptions.map((time) => (
                                            <MenuItem key={`end-time-${time.value}`} value={time.value}>
                                                {time.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Preistyp</InputLabel>
                                    <Select
                                        value={pricing.priceType}
                                        label="Preistyp"
                                        onChange={(e) => handlePricingChange(index, "priceType", e.target.value)}
                                    >
                                        {priceTypeOptions.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            {/* Price field with currency formatting */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <TextField
                                    fullWidth
                                    label="Preis"
                                    size="small"
                                    value={editingPriceIndex === index ? editingPriceValue : formatPriceForDisplay(pricing.price)}
                                    onFocus={() => handlePriceFocus(index)}
                                    onChange={handlePriceChange}
                                    onBlur={handlePriceBlur}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                        },
                                    }}
                                />
                            </Grid2>

                            {/* Exclusive options */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={pricing.exclusivePossible}
                                            onChange={(e) => handlePricingChange(index, "exclusivePossible", e.target.checked)}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: { sm: "auto", md: "12px", lg: "unset" } }}>Exklusiv möglich</Typography>
                                    }
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={pricing.exclusiveMandatory}
                                            onChange={(e) => handlePricingChange(index, "exclusiveMandatory", e.target.checked)}
                                            disabled={!pricing.exclusivePossible}
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: { sm: "auto", md: "12px", lg: "unset" } }}>Exklusiv Pflicht</Typography>
                                    }
                                />
                            </Grid2>

                            {/* Action buttons */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 1.333 }}>
                                <Box sx={{ display: "flex", gap: 1, justifyContent: "end" }}>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleSavePricing(pricing, index)}
                                        aria-label="Speichern"
                                        disabled={!modifiedRows.has(index)}
                                    >
                                        <Save color={
                                            !modifiedRows.has(index)
                                                ? theme.palette.customColors.blue.halflight
                                                : theme.palette.customColors.blue.main}
                                        />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDeletePricing(index)} aria-label="Löschen">
                                        <Trash2 color="red" />
                                    </IconButton>
                                </Box>
                            </Grid2>

                            {/* Show row-specific error message */}
                            {slotErrors[index] && (
                                <Grid2 size={{ xs: 12 }}>
                                    <Typography color="error">{slotErrors[index]}</Typography>
                                </Grid2>
                            )}
                        </Grid2>
                    </Paper>
                ))}

            {/* Add new pricing button */}
            <Button
                variant="contained"
                onClick={handleAddPricing}
                disabled={!roomId}
                sx={{
                    mt: 2,
                    p: 1,
                    minWidth: "auto",
                }}
            >
                <Plus color="white" strokeWidth={4} />
            </Button>
        </Box>
    )
}

export default RoomPricings

