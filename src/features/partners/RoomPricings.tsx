import type React from "react"
import { type RoomPricingModel, createEmptyRoomPricingModel, toPricingSlot } from "@/models/RoomPricingModel"
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
    IconButton,
    Paper,
    Grid2,
    InputAdornment,
    useMediaQuery,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material"
import { ChevronDown, Circle, CirclePlus, Plus, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import theme from "@/theme"
import { useAuthContext } from "@/auth/AuthContext"
import { AvailablePriceTypes, AvailablePricingLabels, AvailablePricingLabelsBasic, doPricingSlotsOverlap, FormatPrice, PriceTypes } from "@/utils/pricingManager"
import { WaitIcon } from "@/components/WaitIcon"
import TooltipInfo from "@/components/TooltipInfo"

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

const germanShortDaysOfWeek = [
    { value: 0, label: "Mo" },
    { value: 1, label: "Di" },
    { value: 2, label: "Mi" },
    { value: 3, label: "Do" },
    { value: 4, label: "Fr" },
    { value: 5, label: "Sa" },
    { value: 6, label: "So" },
]

// Generate time options in 30 min steps
const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const hourStr = hour.toString().padStart(2, "0");
            const minuteStr = minute.toString().padStart(2, "0");
            options.push({
                value: `${hourStr}:${minuteStr}:00`,
                label: `${hourStr}:${minuteStr}`,
            });
        }
    }
    // Add 23:59 as the "end of day" option
    options.push({
        value: "23:59:00",
        label: "Ende des Tages (00:00)",
    });
    return options;
};

// Type for duration options
interface DurationOption {
    value: number;
    label: string;
}

// Generate duration options in 30 min steps up to 3 hours, then hour steps up to 6 hours
const generateDurationOptions = (): DurationOption[] => {
    const options: DurationOption[] = [{ value: 0, label: "Keine" }];

    // Half-hour steps up to 3 hours
    for (let hour = 0; hour < 3; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const hours = hour + minute / 60;
            if (hour === 0 && minute === 0) continue; // Skip 0 h 0 min
            const minuteStr = minute.toString().padStart(2, "0");
            options.push({
                value: hours,
                label: `${hour} h ${minuteStr} min`,
            });
        }
    }

    // Hour steps from 3 to 6 hours
    for (let hour = 3; hour <= 6; hour++) {
        options.push({
            value: hour,
            label: `${hour} h 00 min`,
        });
    }

    return options;
};

const timeOptions = generateTimeOptions()
const durationOptions = generateDurationOptions()

// Function to format duration for display
const formatDurationForDisplay = (value: number): string => {
    if (value === 0) {
        return "Keine"
    }
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    const minuteStr = minutes.toString().padStart(2, "0");
    return `${hours} h ${minuteStr} min`;
}

// Exclusive type options
const exclusiveTypeOptions = [
    { value: "none", label: "Keine" },
    { value: "optional", label: "Optional" },
    { value: "mandatory", label: "Pflicht" },
]

// Room pricing type options
const roomPricingTypeOptions = [
    { value: "basic", label: "Grundpreis" },
    { value: "extra", label: "Aufpreis" },
]

const roomPriceTypeInfo = "Der Grundpreis legt den Basispreis für deinen Raum fest. " +
    "Zeitslots von Grundpreisen dürfen sich nicht überschneiden. \n" +
    "Aufpreise fallen zusätzlich an festgelegten Zeitslots an. Aufpreise dürfen sich überschneiden.";

interface Props {
    roomId?: number | null
}

// Function to format price for display
const formatPriceForDisplay = (value: number | null): string => {
    // Handle null or undefined by returning empty string
    if (value === null || value === undefined) {
        return ""
    }
    // Using comma as decimal separator for German formatting
    return value.toString().replace(".", ",")
}

const RoomPricings = ({ roomId }: Props) => {
    const { authUser } = useAuthContext()
    const [pricingId, setPricingId] = useState<number | null>(null)
    const [pricings, setPricings] = useState<RoomPricingModel[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [slotErrors, setSlotErrors] = useState<{ [key: number]: string | null }>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // Track editing state for price fields
    const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null)
    const [editingPriceValue, setEditingPriceValue] = useState<string>("")
    const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set())
    const [expanded, setExpanded] = useState<number | false>(false)
    const [editingExclusivePriceIndex, setEditingExclusivePriceIndex] = useState<number | null>(null)
    const [editingExclusivePriceValue, setEditingExclusivePriceValue] = useState<string>("")
    const [editingCustomNameIndex, setEditingCustomNameIndex] = useState<number | null>(null)
    const [editingCustomNameValue, setEditingCustomNameValue] = useState<string>("")
    const [editingMinPersonsIndex, setEditingMinPersonsIndex] = useState<number | null>(null)
    const [editingMinPersonsValue, setEditingMinPersonsValue] = useState<string>("")
    const [editingMaxPersonsIndex, setEditingMaxPersonsIndex] = useState<number | null>(null)
    const [editingMaxPersonsValue, setEditingMaxPersonsValue] = useState<string>("")

    const fetchPricings = async (roomId: number, selected: number | null | undefined = undefined) => {
        try {
            const fetchedPricings = await fetchRoomPricingsByRoom(roomId, setIsLoading, setError)
            // Normalize prepTime and followUpTime to numbers
            const normalizedPricings = fetchedPricings?.map((pricing: RoomPricingModel) => ({
                ...pricing,
                prepTime: typeof pricing.prepTime === 'string' ? parseFloat(pricing.prepTime) : pricing.prepTime ?? 0,
                followUpTime: typeof pricing.followUpTime === 'string' ? parseFloat(pricing.followUpTime) : pricing.followUpTime ?? 0,
            })) || []
            setPricings(normalizedPricings)
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

    const handleAddPricing = () => {
        if (!roomId) return

        const newPricing = createEmptyRoomPricingModel(roomId)
        newPricing.roomPricingType = "basic" // Default to "Grundpreis"

        setPricings((prev) => {
            const newPricings = prev ? [...prev, newPricing] : [newPricing]

            // Reset errors
            setSlotErrors((prevErrors) => {
                const newErrors = { ...prevErrors }
                delete newErrors[newPricings.length - 1]
                return newErrors
            })

            // Mark the new row as modified
            setModifiedRows((prev) => {
                const newSet = new Set(prev)
                newSet.add(newPricings.length - 1)
                return newSet
            })

            // Expand the new row
            setExpanded(pricings?.length ?? 0)

            return newPricings
        })
    }

    const handlePricingChange = (index: number, field: keyof RoomPricingModel, value: RoomPricingModel[keyof RoomPricingModel]) => {
        if (!pricings) return
        const updatedPricings = [...pricings]
        updatedPricings[index] = {
            ...updatedPricings[index],
            [field]: value,
        }

        // Reset exclusive and person fields when switching to 'extra'
        if (field === "roomPricingType" && value === "extra") {
            updatedPricings[index].exclusiveType = "none"
            updatedPricings[index].exclusivePriceType = null
            updatedPricings[index].exclusivePrice = null
            updatedPricings[index].minPersons = 0
            updatedPricings[index].maxPersons = 0
        }
        // Reset person fields when switching to 'basic'
        if (field === "roomPricingType" && value === "basic") {
            updatedPricings[index].minPersons = 0
            updatedPricings[index].maxPersons = 0
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
            if (pricings.some((p) => p.id != pricing.id &&
                doPricingSlotsOverlap(toPricingSlot(p), toPricingSlot(pricing)))) {
                setSlotErrors((prevErrors) => ({
                    ...prevErrors,
                    [index]: "Zeit-Slots dürfen sich nicht überlagern!",
                }))
                return
            }
        }

        // Normalize before sending to ensure numbers are sent
        const normalizedForSave = {
            ...pricing,
            price: typeof pricing.price === "string" ? Number.parseFloat(pricing.price as unknown as string) : pricing.price,
            exclusivePrice: pricing.exclusivePrice === null || pricing.exclusivePrice === undefined
                ? null
                : (typeof pricing.exclusivePrice === "string"
                    ? Number.parseFloat(pricing.exclusivePrice as unknown as string)
                    : pricing.exclusivePrice),
            prepTime: pricing.prepTime,
            followUpTime: pricing.followUpTime,
            minPersons: pricing.minPersons,
            maxPersons: pricing.maxPersons,
        } as RoomPricingModel

        await createRoomPricing(
            authUser.idToken,
            normalizedForSave,
            (result) => {
                if (result.id) {
                    pricing.id = result.id
                }
                // Remove from modified rows after successful save
                setModifiedRows((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(index)
                    return newSet
                })
                // Clear any existing errors for this row
                setSlotErrors((prevErrors) => {
                    const newErrors = { ...prevErrors }
                    delete newErrors[index]
                    return newErrors
                })
            },
            (errMsg) => {
                setSlotErrors((prevErrors) => ({
                    ...prevErrors,
                    [index]: errMsg ?? "Zeit-Slot konnte nicht gespeichert werden!",
                }))
            },
        )
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

    // Handle exclusive price field focus
    const handleExclusivePriceFocus = (index: number) => {
        if (!pricings) return
        setEditingExclusivePriceIndex(index)
        setEditingExclusivePriceValue(formatPriceForDisplay(pricings[index].exclusivePrice))
    }

    // Handle exclusive price field change during editing
    const handleExclusivePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and comma/dot for decimal
        const value = e.target.value.replace(/[^0-9,.]/g, "")
        setEditingExclusivePriceValue(value)
    }

    // Handle exclusive price field blur - convert to number and update state
    const handleExclusivePriceBlur = () => {
        if (editingExclusivePriceIndex === null || !pricings) return

        // Convert the edited value to a number
        let numericValue = null
        try {
            // Replace comma with dot for parsing
            const normalizedValue = editingExclusivePriceValue.replace(",", ".")
            if (normalizedValue.trim() !== "") {
                numericValue = Number.parseFloat(normalizedValue)
                if (isNaN(numericValue)) numericValue = null
            }
        } catch (e) {
            numericValue = null
        }

        // Update the pricing with the new value
        handlePricingChange(editingExclusivePriceIndex, "exclusivePrice", numericValue)
        setEditingExclusivePriceIndex(null)
        setEditingExclusivePriceValue("")
    }

    // Handle custom name field focus
    const handleCustomNameFocus = (index: number) => {
        if (!pricings) return
        setEditingCustomNameIndex(index)
        setEditingCustomNameValue(pricings[index].customName || "")
    }

    // Handle custom name field change during editing
    const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingCustomNameValue(e.target.value)
    }

    // Handle custom name field blur - update state
    const handleCustomNameBlur = () => {
        if (editingCustomNameIndex === null || !pricings) return

        // Update the pricing with the new value (allow empty string to become null)
        const value = editingCustomNameValue.trim() === "" ? null : editingCustomNameValue.trim()
        handlePricingChange(editingCustomNameIndex, "customName", value)
        setEditingCustomNameIndex(null)
        setEditingCustomNameValue("")
    }

    // Handle minPersons field focus
    const handleMinPersonsFocus = (index: number) => (event: React.FocusEvent<HTMLInputElement>) => {
        if (!pricings) return
        setEditingMinPersonsIndex(index)
        setEditingMinPersonsValue(pricings[index].minPersons?.toString() || "0")
        event.target.select()
    }

    // Handle minPersons field change during editing
    const handleMinPersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only integers
        const value = e.target.value.replace(/[^0-9]/g, "")
        setEditingMinPersonsValue(value)
    }

    // Handle minPersons field blur - convert to number and update state
    const handleMinPersonsBlur = () => {
        if (editingMinPersonsIndex === null || !pricings) return

        // Convert the edited value to a number
        let numericValue = 0
        try {
            numericValue = Number.parseInt(editingMinPersonsValue)
            if (isNaN(numericValue)) numericValue = 0
        } catch (e) {
            numericValue = 0
        }

        // Update the pricing with the new value
        handlePricingChange(editingMinPersonsIndex, "minPersons", numericValue)
        setEditingMinPersonsIndex(null)
        setEditingMinPersonsValue("")
    }

    // Handle maxPersons field focus
    const handleMaxPersonsFocus = (index: number) => (event: React.FocusEvent<HTMLInputElement>) => {
        if (!pricings) return
        setEditingMaxPersonsIndex(index)
        setEditingMaxPersonsValue(pricings[index].maxPersons?.toString() || "0")
        event.target.select()
    }

    // Handle maxPersons field change during editing
    const handleMaxPersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only integers
        const value = e.target.value.replace(/[^0-9]/g, "")
        setEditingMaxPersonsValue(value)
    }

    // Handle maxPersons field blur - convert to number and update state
    const handleMaxPersonsBlur = () => {
        if (editingMaxPersonsIndex === null || !pricings) return

        // Convert the edited value to a number
        let numericValue = 0
        try {
            numericValue = Number.parseInt(editingMaxPersonsValue)
            if (isNaN(numericValue)) numericValue = 0
        } catch (e) {
            numericValue = 0
        }

        // Update the pricing with the new value
        handlePricingChange(editingMaxPersonsIndex, "maxPersons", numericValue)
        setEditingMaxPersonsIndex(null)
        setEditingMaxPersonsValue("")
    }

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const handleAccordionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? index : false)
    }

    useEffect(() => {
        if (!roomId) {
            return
        }
        fetchPricings(roomId, null)
    }, [roomId])

    if (isLoading) {
        return <WaitIcon />
    }

    if (error) {
        return <Typography color="error">{error}</Typography>
    }

    return (
        <Box sx={{ mt: 2 }}>
            {pricings &&
                pricings.map((pricing, index) => (
                    <Accordion
                        key={index}
                        expanded={isMobile ? expanded === index : true}
                        onChange={isMobile ? handleAccordionChange(index) : undefined}
                        sx={{
                            boxShadow: "none",
                            "&:before": { display: "none" },
                            backgroundColor: "transparent",
                            mt: { xs: 1, md: 0 },
                        }}
                    >
                        {isMobile && (
                            <AccordionSummary
                                expandIcon={<ChevronDown color={theme.palette.customColors.blue.main} />}
                                sx={{
                                    display: { xs: "flex", sm: "none" },
                                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="subtitle1">
                                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", verticalAlign: "top", mt: 0.5, mr: 1 }}>
                                        {pricing.roomPricingType == "extra" ? (
                                            <CirclePlus color="#002A58" size={18} />
                                        ) : (
                                            <Circle color="#002A58" size={18} />
                                        )}
                                    </Box>
                                    {germanShortDaysOfWeek.find((d) => d.value === pricing.startDayOfWeek)?.label},{" "}
                                    {pricing.startTime.slice(0, 5)}, {" "}
                                    {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(pricing.price)} €
                                </Typography>
                            </AccordionSummary>
                        )}

                        <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Paper sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: pricing.roomPricingType === "extra"
                                    ? "#eeeeeeff"
                                    : "transparent",
                                /*border: pricing.roomPricingType === "extra" ? "1px solid #a5b4c4" : "none"*/
                            }}>
                                <Grid2 container spacing={2} alignItems="center"
                                >
                                    {/* Row 1: Room Pricing Type, Custom Name, Price Type, Price */}
                                    <Grid2 size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Preisdetails</Typography>
                                    </Grid2>
                                    <Grid2 container spacing={2} size={{ xs: 12 }}>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id="room-pricing-type-label"
                                                    sx={{
                                                        flexShrink: 0,
                                                        lineHeight: '1.5rem',
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <TooltipInfo
                                                        content={roomPriceTypeInfo}
                                                        label="Typ"
                                                        iconSize={24}
                                                        enterTouchDelay={0}
                                                        leaveTouchDelay={12000}
                                                    />
                                                </InputLabel>
                                                <Select
                                                    labelId="room-pricing-type-label"
                                                    value={pricing.roomPricingType || 'basic'}
                                                    label="Typ"
                                                    onChange={(e) => handlePricingChange(index, 'roomPricingType', e.target.value)}
                                                >
                                                    {roomPricingTypeOptions.map((type) => (
                                                        <MenuItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
                                            <TextField
                                                fullWidth
                                                label="Bezeichnung (optional)"
                                                size="small"
                                                value={
                                                    editingCustomNameIndex === index
                                                        ? editingCustomNameValue
                                                        : pricing.customName || ""
                                                }
                                                onFocus={() => handleCustomNameFocus(index)}
                                                onChange={handleCustomNameChange}
                                                onBlur={handleCustomNameBlur}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Preistyp</InputLabel>
                                                <Select
                                                    value={pricing.priceType}
                                                    label="Preistyp"
                                                    onChange={(e) => handlePricingChange(index, "priceType", e.target.value)}
                                                >
                                                    {AvailablePriceTypes.map((priceType) => (
                                                        <MenuItem key={priceType} value={priceType}>
                                                            {FormatPrice.translatePrice(
                                                                priceType as PriceTypes,
                                                                { noneLabelKey: "free" }
                                                            )}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Preis-Label</InputLabel>
                                                <Select
                                                    value={pricing.pricingLabel || "exact"}
                                                    label="Preis-Label"
                                                    onChange={(e) => handlePricingChange(index, "pricingLabel", e.target.value)}
                                                >
                                                    {(pricing.roomPricingType == "extra"
                                                        ? AvailablePricingLabelsBasic
                                                        : AvailablePricingLabels).
                                                        map((label) => (
                                                            <MenuItem key={label} value={label}>
                                                                {FormatPrice.translate(label)}
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                            </FormControl>
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
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
                                    </Grid2>

                                    {/* Row 2: Start Day, Start Time, End Day, End Time */}
                                    <Grid2 size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Zeitfenster</Typography>
                                    </Grid2>
                                    <Grid2 container spacing={2} size={{ xs: 12 }}>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
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
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
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
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
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
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
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
                                    </Grid2>

                                    {/* Row 3: Exclusive Fields */}
                                    {pricing.roomPricingType === "basic" && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Exklusivität</Typography>
                                        </Grid2>
                                    )}
                                    {pricing.roomPricingType === "basic" && (
                                        <Grid2 container spacing={2} size={{ xs: 12 }}>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Exklusivität</InputLabel>
                                                    <Select
                                                        value={pricing.exclusiveType || "none"}
                                                        label="Exklusivität"
                                                        onChange={(e) => handlePricingChange(index, "exclusiveType", e.target.value)}
                                                    >
                                                        {exclusiveTypeOptions.map((type) => (
                                                            <MenuItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Preistyp Exklusivität</InputLabel>
                                                    <Select
                                                        value={pricing.exclusivePriceType || ""}
                                                        label="Preistyp Exklusivität"
                                                        disabled={pricing.exclusiveType === "none" || !pricing.exclusiveType}
                                                        onChange={(e) => handlePricingChange(index, "exclusivePriceType", e.target.value)}
                                                    >
                                                        {AvailablePriceTypes.map((priceType) => (
                                                            <MenuItem key={priceType} value={priceType}>
                                                                {FormatPrice.translatePrice(
                                                                    priceType as PriceTypes,
                                                                    { noneLabelKey: "free" }
                                                                )}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Preis-Label Exklusivität</InputLabel>
                                                    <Select
                                                        value={pricing.exclusivePricingLabel || "exact"}
                                                        label="Preis-Label Exklusivität"
                                                        onChange={(e) => handlePricingChange(index, "exclusivePricingLabel", e.target.value)}
                                                    >
                                                        {AvailablePricingLabels.map((priceType) => (
                                                            <MenuItem key={priceType} value={priceType}>
                                                                {FormatPrice.translate(priceType)}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Aufpreis Exklusivität"
                                                    size="small"
                                                    disabled={pricing.exclusiveType === "none" || !pricing.exclusiveType}
                                                    value={
                                                        editingExclusivePriceIndex === index
                                                            ? editingExclusivePriceValue
                                                            : formatPriceForDisplay(pricing.exclusivePrice)
                                                    }
                                                    onFocus={() => handleExclusivePriceFocus(index)}
                                                    onChange={handleExclusivePriceChange}
                                                    onBlur={handleExclusivePriceBlur}
                                                    slotProps={{
                                                        input: {
                                                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                        },
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    )}

                                    {/* Row 4: Number of Persons (only for extra) */}
                                    {pricing.roomPricingType === "extra" && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Anzahl Personen</Typography>
                                        </Grid2>
                                    )}
                                    {pricing.roomPricingType === "extra" && (
                                        <Grid2 container spacing={2} size={{ xs: 12 }}>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Von"
                                                    size="small"
                                                    placeholder="Anzahl"
                                                    value={
                                                        editingMinPersonsIndex === index
                                                            ? editingMinPersonsValue
                                                            : pricing.minPersons?.toString() || "0"
                                                    }
                                                    onFocus={handleMinPersonsFocus(index)}
                                                    onChange={handleMinPersonsChange}
                                                    onBlur={handleMinPersonsBlur}
                                                />
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Bis"
                                                    size="small"
                                                    placeholder="Anzahl"
                                                    value={
                                                        editingMaxPersonsIndex === index
                                                            ? editingMaxPersonsValue
                                                            : pricing.maxPersons?.toString() || "0"
                                                    }
                                                    onFocus={handleMaxPersonsFocus(index)}
                                                    onChange={handleMaxPersonsChange}
                                                    onBlur={handleMaxPersonsBlur}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    )}

                                    {/* Row 5: Event Duration Extension (only for extra) */}
                                    {pricing.roomPricingType === "extra" && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Eventdauer erweitern</Typography>
                                        </Grid2>
                                    )}
                                    {pricing.roomPricingType === "extra" && (
                                        <Grid2 container spacing={2} size={{ xs: 12 }}>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Vorbereitung</InputLabel>
                                                    <Select<number>
                                                        value={pricing.prepTime ?? 0}
                                                        label="Vorbereitung"
                                                        onChange={(e) => handlePricingChange(index, "prepTime", e.target.value as number)}
                                                    >
                                                        {durationOptions.map((option) => (
                                                            <MenuItem key={`prep-${option.value}`} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Nachbereitung</InputLabel>
                                                    <Select<number>
                                                        value={pricing.followUpTime ?? 0}
                                                        label="Nachbereitung"
                                                        onChange={(e) => handlePricingChange(index, "followUpTime", e.target.value as number)}
                                                    >
                                                        {durationOptions.map((option) => (
                                                            <MenuItem key={`followup-${option.value}`} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid2>
                                        </Grid2>
                                    )}

                                    {/* Row 6: Action Buttons, Error */}
                                    <Grid2 size={{ xs: 12 }}>
                                        <Box sx={{ display: "flex", gap: 1, justifyContent: "end" }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleSavePricing(pricing, index)}
                                                aria-label="Speichern"
                                                disabled={!modifiedRows.has(index)}
                                            >
                                                <Save
                                                    color={
                                                        !modifiedRows.has(index)
                                                            ? theme.palette.customColors.blue.halflight
                                                            : theme.palette.customColors.blue.main
                                                    }
                                                />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDeletePricing(index)} aria-label="Löschen">
                                                <Trash2 color="red" />
                                            </IconButton>
                                        </Box>
                                    </Grid2>
                                    {slotErrors[index] && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography color="error">{slotErrors[index]}</Typography>
                                        </Grid2>
                                    )}
                                </Grid2>
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
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

export default RoomPricings;