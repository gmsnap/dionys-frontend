"use client"

import { useEffect, useState, useRef } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
} from "date-fns"
import { de } from "date-fns/locale"
import { Button, Container, Typography, Box, Paper, Stack, IconButton, Tooltip, Badge, Grid2, useMediaQuery, useTheme } from "@mui/material"
import { ChevronLeft, ChevronRight, CalendarIcon as Calendar1, CalendarDays } from "lucide-react"
import theme from "@/theme"

// Updated event type with start and end times
export interface CalendarEvent {
    id: number
    title: string
    start: Date // Start time
    end: Date // End time
    color: string
}

interface EventCalendarProps {
    events: CalendarEvent[]
    onDateRangeChange?: (range: { start: Date; end: Date }) => void
}

type ViewType = "month" | "week"

// Generate hours for the full day (0 to 23)
const hours = Array.from({ length: 24 }, (_, i) => i)

export default function EventCalendar({ events, onDateRangeChange }: EventCalendarProps) {
    const theme = useTheme();
    // Set initial date to current date
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<ViewType>("week") // Default to week view for time-based display
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const timeIndicatorRef = useRef<NodeJS.Timeout | null>(null)

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Update current time every minute
    useEffect(() => {
        const updateCurrentTime = () => {
            setCurrentTime(new Date())
        }

        // Initial update
        updateCurrentTime()

        // Set up interval to update every minute
        timeIndicatorRef.current = setInterval(updateCurrentTime, 60000)

        // Clean up on unmount
        return () => {
            if (timeIndicatorRef.current) {
                clearInterval(timeIndicatorRef.current)
            }
        }
    }, [])

    // Navigation functions
    const nextPeriod = () => {
        if (view === "month") {
            setCurrentDate(addMonths(currentDate, 1))
        } else {
            setCurrentDate(addWeeks(currentDate, 1))
        }
    }

    const prevPeriod = () => {
        if (view === "month") {
            setCurrentDate(subMonths(currentDate, 1))
        } else {
            setCurrentDate(subWeeks(currentDate, 1))
        }
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    // Get days to display based on current view
    const getDaysToDisplay = () => {
        if (view === "month") {
            const monthStart = startOfMonth(currentDate)
            const monthEnd = endOfMonth(currentDate)
            // Start from the beginning of the week containing the first day of the month
            const startDate = startOfWeek(monthStart)
            // End at the end of the week containing the last day of the month
            const endDate = endOfWeek(monthEnd)

            return eachDayOfInterval({ start: startDate, end: endDate })
        } else {
            const weekStart = startOfWeek(currentDate)
            const weekEnd = endOfWeek(currentDate)

            return eachDayOfInterval({ start: weekStart, end: weekEnd })
        }
    }

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(
            (event) =>
                event.start.getFullYear() === day.getFullYear() &&
                event.start.getMonth() === day.getMonth() &&
                event.start.getDate() === day.getDate(),
        )
    }

    // Format the header text based on current view
    const getHeaderText = () => {
        if (isMobile || view === "month") {
            return format(currentDate, "MMMM yyyy", { locale: de })
        } else {
            const weekStart = startOfWeek(currentDate)
            const weekEnd = endOfWeek(currentDate)
            return `${format(weekStart, "d.", { locale: de })} - ${format(weekEnd, "d. MMMM yyyy", { locale: de })}`
        }
    }

    // Calculate position and height for an event in the time grid
    const calculateEventPosition = (event: CalendarEvent) => {
        // Full day is 24 hours (24 * 60 = 1440 minutes)
        const dayTotalMinutes = 24 * 60

        // Calculate minutes from midnight for event start and end
        const eventStartMinutes = event.start.getHours() * 60 + event.start.getMinutes()
        const eventEndMinutes = event.end.getHours() * 60 + event.end.getMinutes()

        // Calculate position from top (in %)
        const topPosition = (eventStartMinutes / dayTotalMinutes) * 100 * 0.95

        // Calculate height (in %)
        const height = ((eventEndMinutes - eventStartMinutes) / dayTotalMinutes) * 100 * 0.95

        return {
            top: `${Math.max(0, topPosition)}%`,
            height: `${Math.min(100, height)}%`,
        }
    }

    // Calculate position for current time indicator
    const calculateCurrentTimePosition = () => {
        const dayTotalMinutes = 24 * 60
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
        return (currentMinutes / dayTotalMinutes) * 100
    }

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    const days = getDaysToDisplay()
    const weekDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] // German weekday abbreviations

    useEffect(() => {
        if (onDateRangeChange) {
            const days = getDaysToDisplay()
            onDateRangeChange({
                start: days[0],
                end: days[days.length - 1],
            })
        }
    }, [currentDate, view, onDateRangeChange])

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={isMobile ? 0 : 3} sx={{ p: isMobile ? 0 : 3 }}>

                {/* Calendar Header (Desktop) */}
                {!isMobile &&
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button variant="contained" onClick={goToToday}>
                                Heute
                            </Button>
                            <IconButton onClick={prevPeriod}>
                                <ChevronLeft color={theme.palette.customColors.blue.main} />
                            </IconButton>
                            <IconButton onClick={nextPeriod}>
                                <ChevronRight color={theme.palette.customColors.blue.main} />
                            </IconButton>
                            <Typography variant="h5" sx={{ ml: 2 }}>
                                {getHeaderText()}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant={view === "month" ? "contained" : "outlined"}
                                    onClick={() => setView("month")}
                                    startIcon={
                                        <CalendarDays
                                            color={view === "month"
                                                ? 'white'
                                                : theme.palette.customColors.blue.main}
                                        />}
                                >
                                    Monat
                                </Button>
                                <Button
                                    variant={view === "week" ? "contained" : "outlined"}
                                    onClick={() => setView("week")}
                                    startIcon={
                                        <Calendar1
                                            color={view === "week"
                                                ? 'white'
                                                : theme.palette.customColors.blue.main}
                                        />}
                                >
                                    Woche
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                }

                {/* Calendar Header (Mobile) */}
                {isMobile &&
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton onClick={prevPeriod}>
                                <ChevronLeft color={theme.palette.customColors.blue.main} />
                            </IconButton>
                            <IconButton onClick={nextPeriod}>
                                <ChevronRight color={theme.palette.customColors.blue.main} />
                            </IconButton>
                            <Typography variant="h5" sx={{ ml: 2 }}>
                                {getHeaderText()}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant={view === "month" ? "contained" : "outlined"}
                                    onClick={() => setView("month")}
                                >
                                    <CalendarDays
                                        color={view === "month"
                                            ? 'white'
                                            : theme.palette.customColors.blue.main}
                                    />
                                </Button>
                                <Button
                                    variant={view === "week" ? "contained" : "outlined"}
                                    onClick={() => setView("week")}
                                >
                                    <Calendar1
                                        color={view === "week"
                                            ? 'white'
                                            : theme.palette.customColors.blue.main}
                                    />
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                }

                {view === "month" ? (
                    // Monthly view
                    <>
                        {/* Weekday Headers */}
                        <Grid2 container>
                            {weekDays.map((day) => (
                                <Grid2
                                    key={day}
                                    size={{ xs: 12 / 7 }}
                                    sx={{
                                        textAlign: "center",
                                        p: 1,
                                        borderBottom: 1,
                                        borderColor: "divider",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {day}
                                </Grid2>
                            ))}
                        </Grid2>

                        {/* Calendar Grid */}
                        <Grid2 container>
                            {days.map((day, i) => {
                                const dayEvents = getEventsForDay(day)
                                const isCurrentMonth = isSameMonth(day, currentDate)
                                const isToday = isSameDay(day, new Date())

                                return (
                                    <Grid2
                                        key={i}
                                        size={{ xs: 12 / 7 }}
                                        sx={{
                                            height: 120,
                                            p: 0.5,
                                            border: 1,
                                            borderColor: "divider",
                                            bgcolor: isToday ? "action.hover" : "background.paper",
                                            opacity: isCurrentMonth ? 1 : 0.5,
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                p: 0.5,
                                                fontWeight: isToday ? "bold" : "regular",
                                                color: isToday ? "primary.main" : "text.primary",
                                                textAlign: "center",
                                                borderRadius: "50%",
                                                width: 30,
                                                height: 30,
                                                mx: "auto",
                                                mb: 0.5,
                                                bgcolor: isToday ? "primary.light" : "transparent",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {format(day, "d")}
                                        </Typography>

                                        <Box sx={{ overflow: "auto", maxHeight: "calc(100% - 40px)" }}>
                                            {dayEvents.length > 0 &&
                                                dayEvents.map((event) => (
                                                    <Tooltip
                                                        key={event.id}
                                                        title={`${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}: ${event.title}`}
                                                        arrow
                                                    >
                                                        <Paper
                                                            onClick={() => handleEventClick(event)}
                                                            sx={{
                                                                p: 0.5,
                                                                mb: 0.5,
                                                                bgcolor: event.color,
                                                                color: "white",
                                                                borderRadius: 1,
                                                                fontSize: "0.75rem",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                cursor: "pointer",
                                                                "&:hover": {
                                                                    opacity: 0.9,
                                                                },
                                                            }}
                                                        >
                                                            {format(event.start, "HH:mm")} {event.title}
                                                        </Paper>
                                                    </Tooltip>
                                                ))}

                                            {dayEvents.length > 3 && (
                                                <Badge
                                                    badgeContent={`+${dayEvents.length - 3}`}
                                                    color="primary"
                                                    sx={{ display: "block", textAlign: "center", mt: 0.5 }}
                                                />
                                            )}
                                        </Box>
                                    </Grid2>
                                )
                            })}
                        </Grid2>
                    </>
                ) : (
                    // Weekly view with time grid
                    <Box sx={{ display: "flex", height: "100%", border: 1, borderColor: "divider" }}>
                        {/* Time column */}
                        <Box sx={{ width: "60px", borderRight: 1, borderColor: "divider", flexShrink: 0 }}>
                            {/* Empty cell for the corner */}
                            <Box sx={{ height: "50px", borderBottom: 1, borderColor: "divider" }}></Box>

                            {/* Hour labels - 24 hour format */}
                            {hours.map((hour) => (
                                hour < 23 && (
                                    <Box
                                        key={hour}
                                        sx={{
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderBottom: 1,
                                            borderColor: "divider",
                                            fontSize: "0.75rem",
                                            color: "text.secondary",
                                        }}
                                    >
                                        {(hour + 1).toString().padStart(2, "0")}:00
                                    </Box>
                                )
                            ))}
                        </Box>

                        {/* Days columns */}
                        <Box sx={{ display: "flex", flexGrow: 1 }}>
                            {days.map((day, dayIndex) => {
                                const dayEvents = getEventsForDay(day)
                                const isToday = isSameDay(day, new Date())

                                return (
                                    <Box
                                        key={dayIndex}
                                        sx={{
                                            flexGrow: 1,
                                            width: 0,
                                            borderRight: dayIndex < 6 ? 1 : 0,
                                            borderColor: "divider",
                                            bgcolor: isToday ? "action.hover" : "background.paper",
                                            position: "relative",
                                        }}
                                    >
                                        {/* Day header */}
                                        <Box
                                            sx={{
                                                height: "50px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderBottom: 1,
                                                borderColor: "divider",
                                                bgcolor: isToday ? "primary.light" : "background.default",
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                {format(day, isMobile ? "EEEEE" : "EEE", { locale: de })}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: isToday ? "bold" : "regular",
                                                    color: isToday ? "primary.main" : "text.primary",
                                                }}
                                            >
                                                {format(day, "d", { locale: de })}
                                            </Typography>
                                        </Box>

                                        {/* Hour cells */}
                                        {hours.map((hour) => (
                                            <Box
                                                key={hour}
                                                sx={{
                                                    height: "40px",
                                                    borderBottom: hour < 23 ? 1 : 0,
                                                    borderColor: "divider",
                                                    position: "relative",
                                                    // Highlight business hours
                                                    bgcolor: hour >= 9 && hour < 18 ? "background.paper" : "action.hover",
                                                    opacity: hour >= 9 && hour < 18 ? 1 : 0.7,
                                                }}
                                            ></Box>
                                        ))}

                                        {/* Current time indicator - only show on today's column */}
                                        {isToday && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: `calc(50px + ${calculateCurrentTimePosition()}%)`,
                                                    left: 0,
                                                    right: 0,
                                                    height: "2px",
                                                    bgcolor: "error.main",
                                                    zIndex: 20,
                                                    "&::before": {
                                                        content: '""',
                                                        position: "absolute",
                                                        left: "-5px",
                                                        top: "-4px",
                                                        width: "10px",
                                                        height: "10px",
                                                        borderRadius: "50%",
                                                        bgcolor: "error.main",
                                                    },
                                                }}
                                            />
                                        )}

                                        {/* Events */}
                                        {dayEvents.map((event) => {
                                            const { top, height } = calculateEventPosition(event)

                                            return (
                                                <Tooltip
                                                    key={event.id}
                                                    title={`${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}: ${event.title}`}
                                                    arrow
                                                >
                                                    <Paper
                                                        onClick={() => handleEventClick(event)}
                                                        sx={{
                                                            position: "absolute",
                                                            top: `calc(50px + ${top})`,
                                                            left: "2px",
                                                            right: "2px",
                                                            height: height,
                                                            minHeight: "24px",
                                                            bgcolor: event.color,
                                                            color: "white",
                                                            borderRadius: 1,
                                                            p: 0.5,
                                                            fontSize: "0.75rem",
                                                            overflow: "hidden",
                                                            cursor: "pointer",
                                                            zIndex: 10,
                                                            "&:hover": {
                                                                opacity: 0.9,
                                                                boxShadow: 2,
                                                            },
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                                                            {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                                                        </Typography>
                                                        {event.title}
                                                    </Paper>
                                                </Tooltip>
                                            )
                                        })}
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    )
}

