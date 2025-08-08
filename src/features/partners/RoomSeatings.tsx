import type React from "react"
import { createEmptyRoomSeatingModel, type RoomSeatingModel } from "@/models/RoomSeatingModel"
import { createRoomSeating, deleteRoomSeating, fetchRoomSeatingsByRoom } from "@/services/roomSeatingService"
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
    Switch,
    FormControlLabel,
} from "@mui/material"
import { ChevronDown, Plus, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import theme from "@/theme"
import { useAuthContext } from "@/auth/AuthContext"
import { WaitIcon } from "@/components/WaitIcon"

// Price type options
const priceTypeOptions = [
    { value: "hour", label: "Pro Stunde" },
    { value: "person", label: "Pro Person" },
    { value: "personHour", label: "Pro Person u. Stunde" },
    { value: "once", label: "pro Event" },
    { value: "none", label: "inklusive" },
]

// Reconfig price type options
const reconfigPriceTypeOptions = [
    { value: "none", label: "Kein Aufpreis" },
    { value: "hour", label: "Pro Stunde" },
    { value: "person", label: "Pro Person" },
    { value: "personHour", label: "Pro Person u. Stunde" },
    { value: "once", label: "pro Event" },
]

// Function to format price for display
const formatPriceForDisplay = (value: number): string => {
    // Using comma as decimal separator for German formatting
    return value.toString().replace(".", ",")
}

// Add seating type options at the top of the file, after the reconfigPriceTypeOptions
const seatingTypeOptions = [
    { value: "empty", label: "ohne Mobiliar" },
    { value: "mixed", label: "Gemischt" },
    { value: "standing", label: "Stehplätze" },
    { value: "seated", label: "Sitzplätze" },
]

interface Props {
    roomId?: number | null
}

const RoomSeatings = ({ roomId }: Props) => {
    const { authUser } = useAuthContext()
    const [seatingId, setSeatingId] = useState<number | null>(null)
    const [seatings, setSeatings] = useState<RoomSeatingModel[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [rowErrors, setRowErrors] = useState<{ [key: number]: string | null }>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // Track editing state for price fields
    const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null)
    const [editingPriceValue, setEditingPriceValue] = useState<string>("")
    const [editingReconfigPriceIndex, setEditingReconfigPriceIndex] = useState<number | null>(null)
    const [editingReconfigPriceValue, setEditingReconfigPriceValue] = useState<string>("")
    const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set())
    const [expanded, setExpanded] = useState<number | false>(false)

    const fetchSeatings = async (roomId: number, selected: number | null | undefined = undefined) => {
        try {
            const fetchedSeatings = await fetchRoomSeatingsByRoom(roomId, setIsLoading, setError)
            setSeatings(fetchedSeatings || [])
            setError(null)
            if (selected !== undefined) {
                setSeatingId(selected)
            }
        } catch (err) {
            setSeatings([])
            setSeatingId(null)
            setError("Error fetching Seatings")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddSeating = () => {
        if (!roomId) return

        const newSeating = createEmptyRoomSeatingModel(roomId)

        setSeatings((prev) => {
            const newSeatings = prev ? [...prev, newSeating] : [newSeating]

            // Reset errors
            setRowErrors((prevErrors) => {
                const newErrors = { ...prevErrors }
                delete newErrors[newSeatings.length - 1] // Remove any errors for the new row
                return newErrors
            })

            // Mark the new row as modified
            setModifiedRows((prev) => {
                const newSet = new Set(prev)
                newSet.add(newSeatings.length - 1)
                return newSet
            })

            // Expand the new row
            setExpanded(seatings?.length ?? 0)

            return newSeatings
        })
    }

    const handleSeatingChange = (index: number, field: keyof RoomSeatingModel, value: any) => {
        if (!seatings) return
        const updatedSeatings = [...seatings]
        updatedSeatings[index] = {
            ...updatedSeatings[index],
            [field]: value,
        }
        setSeatings(updatedSeatings)

        // Mark this row as modified
        setModifiedRows((prev) => {
            const newSet = new Set(prev)
            newSet.add(index)
            return newSet
        })
    }

    const deleteSeating = async (id: number) => {
        if (!authUser?.idToken) {
            setError("Not authorized")
            return
        }
        await deleteRoomSeating(authUser.idToken, id, () => {
            console.log("deleted " + id)
        })
    }

    const handleDeleteSeating = (index: number) => {
        if (!seatings) return

        const updatedSeatings = [...seatings]
        const seatingToDelete = updatedSeatings[index]
        updatedSeatings.splice(index, 1)
        setSeatings(updatedSeatings)

        // Call delete on API
        if (seatingToDelete?.id) {
            deleteSeating(seatingToDelete.id)
        }
    }

    const handleSaveSeating = async (seating: RoomSeatingModel, index: number) => {
        if (!authUser?.idToken) {
            setError("Not authorized")
            return
        }

        // Validate seating name is not empty
        if (!seating.seating.trim()) {
            setRowErrors((prevErrors) => ({
                ...prevErrors,
                [index]: "Sitzplatzname darf nicht leer sein!",
            }))
            return
        }

        await createRoomSeating(
            authUser.idToken,
            seating,
            (result) => {
                if (result.id) {
                    seating.id = result.id
                }
                // Remove from modified rows after successful save
                setModifiedRows((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(index)
                    return newSet
                })
                // Clear any existing errors for this row
                setRowErrors((prevErrors) => {
                    const newErrors = { ...prevErrors }
                    delete newErrors[index]
                    return newErrors
                })
            },
            (errMsg) => {
                setRowErrors((prevErrors) => ({
                    ...prevErrors,
                    [index]: errMsg ?? "Sitzplatz konnte nicht gespeichert werden!",
                }))
            },
        )
    }

    // Handle price field focus
    const handlePriceFocus = (index: number) => {
        if (!seatings) return
        setEditingPriceIndex(index)
        setEditingPriceValue(formatPriceForDisplay(seatings[index].price))
    }

    // Handle price field change during editing
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and comma/dot for decimal
        const value = e.target.value.replace(/[^0-9,.]/g, "")
        setEditingPriceValue(value)
    }

    // Handle price field blur - convert to number and update state
    const handlePriceBlur = () => {
        if (editingPriceIndex === null || !seatings) return

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

        // Update the seating with the new value
        handleSeatingChange(editingPriceIndex, "price", numericValue)
        setEditingPriceIndex(null)
        setEditingPriceValue("")
    }

    // Handle reconfig price field focus
    const handleReconfigPriceFocus = (index: number) => {
        if (!seatings) return
        setEditingReconfigPriceIndex(index)
        if (seatings[index].reconfigPrice !== null) {
            setEditingReconfigPriceValue(formatPriceForDisplay(seatings[index].reconfigPrice))
        } else {
            setEditingReconfigPriceValue("")
        }
    }

    // Handle reconfig price field change during editing
    const handleReconfigPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and comma/dot for decimal
        const value = e.target.value.replace(/[^0-9,.]/g, "")
        setEditingReconfigPriceValue(value)
    }

    // Handle reconfig price field blur - convert to number and update state
    const handleReconfigPriceBlur = () => {
        if (editingReconfigPriceIndex === null || !seatings) return

        // Convert the edited value to a number
        let numericValue = null
        try {
            // Replace comma with dot for parsing
            const normalizedValue = editingReconfigPriceValue.replace(",", ".")
            if (normalizedValue.trim() !== "") {
                numericValue = Number.parseFloat(normalizedValue)
                if (isNaN(numericValue)) numericValue = null
            }
        } catch (e) {
            numericValue = null
        }

        // Update the seating with the new value
        handleSeatingChange(editingReconfigPriceIndex, "reconfigPrice", numericValue)
        setEditingReconfigPriceIndex(null)
        setEditingReconfigPriceValue("")
    }

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const handleAccordionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? index : false)
    }

    useEffect(() => {
        if (!roomId) {
            return
        }
        fetchSeatings(roomId, null)
    }, [roomId])

    if (isLoading) {
        return <WaitIcon />
    }

    if (error) {
        return <Typography color="error">{error}</Typography>
    }

    return (
        <Box sx={{ mt: 2 }}>
            {seatings &&
                seatings.map((seating, index) => (
                    <Accordion
                        key={index}
                        expanded={isMobile ? expanded === index : true} // Always expanded on larger screens
                        onChange={isMobile ? handleAccordionChange(index) : undefined} // Only collapsible in xs
                        sx={{
                            boxShadow: "none",
                            "&:before": { display: "none" }, // Remove the default MUI border
                            backgroundColor: "transparent",
                            mt: { xs: 1, md: 0 },
                        }}
                    >
                        {/* AccordionSummary only visible on xs */}
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
                                    {seating.seating}, {" "}
                                    {seating.isAbsolute
                                        ? `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(seating.price)} €`
                                        : `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(seating.price)}%`}
                                </Typography>
                            </AccordionSummary>
                        )}

                        {/* Content always visible */}
                        <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Paper key={index} sx={{ p: 2, mb: 2 }}>
                                <Grid2 container spacing={2} alignItems="center">

                                    {/* Row 1 */}
                                    <Grid2 size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Seating-Details</Typography>
                                    </Grid2>
                                    <Grid2 container spacing={2} size={{ xs: 12 }}>
                                        {/* Seating type */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Sitzplatztyp</InputLabel>
                                                <Select
                                                    value={seating.seating}
                                                    label="Sitzplatztyp"
                                                    onChange={(e) => handleSeatingChange(index, "seating", e.target.value)}
                                                >
                                                    {seatingTypeOptions.map((type) => (
                                                        <MenuItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid2>

                                        {/* Price type */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Preistyp</InputLabel>
                                                <Select
                                                    value={seating.priceType}
                                                    label="Preistyp"
                                                    onChange={(e) => handleSeatingChange(index, "priceType", e.target.value)}
                                                >
                                                    {priceTypeOptions.map((type) => (
                                                        <MenuItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid2>

                                        {/* Is Absolute switch */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={seating.isAbsolute}
                                                        onChange={(e) => handleSeatingChange(index, "isAbsolute", e.target.checked)}
                                                    />
                                                }
                                                label="Absolut"
                                            />
                                        </Grid2>

                                        {/* Price field with currency or percentage formatting based on isAbsolute */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                            <TextField
                                                fullWidth
                                                label={seating.isAbsolute ? "Preis" : "Prozent"}
                                                size="small"
                                                value={editingPriceIndex === index ? editingPriceValue : formatPriceForDisplay(seating.price)}
                                                onFocus={() => handlePriceFocus(index)}
                                                onChange={handlePriceChange}
                                                onBlur={handlePriceBlur}
                                                slotProps={{
                                                    input: {
                                                        ...(seating.isAbsolute && {
                                                            startAdornment: (
                                                                <InputAdornment position="start">€</InputAdornment>
                                                            ),
                                                        }),
                                                        ...(!seating.isAbsolute && {
                                                            endAdornment: (
                                                                <InputAdornment position="end">%</InputAdornment>
                                                            ),
                                                        }),
                                                    },
                                                }}
                                            />
                                        </Grid2>
                                    </Grid2>

                                    {/* Row 2 */}
                                    <Grid2 size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Aufpreis Umbau</Typography>
                                    </Grid2>
                                    <Grid2 container spacing={2} size={{ xs: 12 }}>
                                        {/* Reconfig price type */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Aufpreis Umbau</InputLabel>
                                                <Select
                                                    value={seating.reconfigPriceType || "none"}
                                                    label="Aufpreis Umbau"
                                                    onChange={(e) => handleSeatingChange(index, "reconfigPriceType", e.target.value)}
                                                >
                                                    {reconfigPriceTypeOptions.map((type) => (
                                                        <MenuItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid2>

                                        {/* Reconfig Is Absolute switch - only enabled when reconfigPriceType is not "none" */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={seating.reconfigIsAbsolute === true}
                                                        disabled={seating.reconfigPriceType === "none"}
                                                        onChange={(e) =>
                                                            handleSeatingChange(
                                                                index,
                                                                "reconfigIsAbsolute",
                                                                seating.reconfigPriceType === "none" ? null : e.target.checked,
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Absolut"
                                            />
                                        </Grid2>

                                        {/* Reconfig Price field - only enabled when reconfigPriceType is not "none" */}
                                        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                                            <TextField
                                                fullWidth
                                                label={seating.reconfigIsAbsolute ? "Aufpreis EUR" : "Aufpreis %"}
                                                size="small"
                                                disabled={seating.reconfigPriceType === "none"}
                                                value={
                                                    editingReconfigPriceIndex === index
                                                        ? editingReconfigPriceValue
                                                        : seating.reconfigPrice !== null
                                                            ? formatPriceForDisplay(seating.reconfigPrice)
                                                            : ""
                                                }
                                                onFocus={() => handleReconfigPriceFocus(index)}
                                                onChange={handleReconfigPriceChange}
                                                onBlur={handleReconfigPriceBlur}
                                                slotProps={{
                                                    input: {
                                                        ...(seating.reconfigIsAbsolute && {
                                                            startAdornment: (
                                                                <InputAdornment position="start">€</InputAdornment>
                                                            ),
                                                        }),
                                                        ...(!seating.reconfigIsAbsolute && {
                                                            endAdornment: (
                                                                <InputAdornment position="end">%</InputAdornment>
                                                            ),
                                                        }),
                                                    },
                                                }}
                                            />
                                        </Grid2>
                                    </Grid2>

                                    {/* Action buttons */}
                                    <Grid2 size={{ xs: 12, }}>
                                        <Box sx={{ display: "flex", gap: 1, justifyContent: "end" }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleSaveSeating(seating, index)}
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
                                            <IconButton color="error" onClick={() => handleDeleteSeating(index)} aria-label="Löschen">
                                                <Trash2 color="red" />
                                            </IconButton>
                                        </Box>
                                    </Grid2>

                                    {/* Show row-specific error message */}
                                    {rowErrors[index] && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography color="error">{rowErrors[index]}</Typography>
                                        </Grid2>
                                    )}
                                </Grid2>
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                ))}

            {/* Add new seating button */}
            <Button
                variant="contained"
                onClick={handleAddSeating}
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

export default RoomSeatings

