import { addDays, differenceInMinutes, isAfter, isBefore, isEqual } from "date-fns";

export interface PricingSlot {
    startDayOfWeek: number;
    startTime: string;  // 'HH:MM:SS'
    endDayOfWeek: number;
    endTime: string;    // 'HH:MM:SS'
    price: number;
    priceType: string;
    exclusiveType: string;
    exclusivePriceType: string | null;
    exclusivePrice: number | null;
};

export interface BookingSeating {
    id: number;
    roomId: number;
    seating: string;
    priceType: string;
    isAbsolute: boolean;
    price: number;
    reconfigPriceType: string;
    reconfigIsAbsolute: boolean | null;
    reconfigPrice: number | null;
    isDefault: boolean;
};

export interface BookingRoom {
    id: number;
    price: number;
    priceType: string;
    minPersons: number;
    maxPersons: number;
    roomPricings?: PricingSlot[];
    roomSeatings?: BookingSeating[];
};

export interface BookingPackage {
    id: number;
    price: number;
    priceType: string;
    minPersons: number;
    maxPersons: number;
};

export interface BookingRoomExtra {
    roomId: number;
    confId: number;
    persons?: number;
    isExclusive?: boolean;
    seating?: string;
};

export interface Booking {
    id: number;
    persons: number;
    date: Date;
    endDate: Date;
    room?: BookingRoom;
    packages?: BookingPackage[];
    rooms?: BookingRoom[];
    roomExtras?: BookingRoomExtra[];
};

const multiplyPriceByPriceType = (
    price: number,
    priceType: PriceTypes,
    h: number,
    p: number
): number => {
    switch (priceType) {
        case 'hour':
            return price * h;
        case 'person':
            return price * p;
        case 'none':
            return 0;
        default:
            return price;
    }
};

export type PriceTypes =
    "day" |
    "once" |
    "hour" |
    "person" |
    "consumption" |
    "none";

const calculatePriceByPriceType = (
    price: number,
    priceType: string,
    hours: number | null,
    persons: number | null
) => {
    switch (priceType) {
        case "hour":
            return hours ? hours * price : 0;
        case "person":
            return hours && persons ? hours * persons * price : 0;
        case "once":
            return price;
        case "none":
        default:
            return 0;
    }
};

export const calculateBooking = (booking: Booking) => {
    let diffInHours = 0;
    if (!booking.date || !booking.endDate) {
        return 0;
    }

    const bookingStart = booking.date;
    const bookingEnd = booking.endDate;

    const diffInMs = bookingEnd.getTime() - bookingStart.getTime();
    diffInHours = diffInMs / (1000 * 60 * 60);

    const persons = booking.persons ?? 1;



    const roomsPrice = booking.rooms?.reduce((total, room) => {
        const extra = booking.roomExtras?.find(r => r.roomId === room.id);
        const isExclusive = extra?.isExclusive === true;
        const seating = extra?.seating;
        const roomPrice = room
            ? calculateBookingPrice({
                bookingStart,
                bookingEnd,
                persons,
                basePrice: room.price,
                basePriceType: room.priceType,
                isExclusive,
                schedules: room.roomPricings,
                seatings: room.roomSeatings,
                seating,
            })
            : 0;
        return total + roomPrice;
    }, 0) || 0;

    let packagePrice = 0;
    if (booking.packages) {
        booking.packages.forEach(p => {
            packagePrice += multiplyPriceByPriceType(
                p.price,
                p.priceType as PriceTypes,
                diffInHours,
                persons);
        });
    }

    return roomsPrice + packagePrice;
}

export interface BookingPriceProps {
    bookingStart: Date;
    bookingEnd: Date;
    persons: number;
    basePrice: number;
    basePriceType: string;
    isExclusive: boolean;
    seating?: string;
    schedules?: PricingSlot[];
    seatings?: BookingSeating[];
    filters?: string[];
}

export const calculateBookingPrice = ({
    bookingStart,
    bookingEnd,
    persons,
    basePrice,
    basePriceType,
    isExclusive,
    seating,
    schedules,
    seatings,
    filters
}: BookingPriceProps) => {
    let totalPrice = 0;
    const coveredRanges: { start: Date; end: Date }[] = [];

    const includePrice = !filters || filters.includes('price');
    const includeExclusive = !filters || filters.includes('exclusive');

    // Helper function to convert JS day (0=Sunday) to custom day (0=Monday)
    const convertToCustomDay = (jsDay: number): number => {
        return jsDay === 0 ? 6 : jsDay - 1; // Sunday (0) becomes 6, others shift left
    };

    // Loop through schedules and apply pricing where applicable
    schedules?.forEach((schedule) => {
        // Get the booking start and end days of week (in our custom format where 0=Monday)
        const bookingStartDay = convertToCustomDay(bookingStart.getDay());
        const bookingEndDay = convertToCustomDay(bookingEnd.getDay());

        // Check if the booking day falls within the schedule's day range
        let isBookingInScheduleDays = false;

        if (schedule.startDayOfWeek <= schedule.endDayOfWeek) {
            // Schedule is within the same week (e.g., Mon-Wed)
            isBookingInScheduleDays =
                (bookingStartDay >= schedule.startDayOfWeek && bookingStartDay <= schedule.endDayOfWeek) ||
                (bookingEndDay >= schedule.startDayOfWeek && bookingEndDay <= schedule.endDayOfWeek);
        } else {
            // Schedule wraps around the week (e.g., Fri-Mon)
            isBookingInScheduleDays =
                (bookingStartDay >= schedule.startDayOfWeek || bookingStartDay <= schedule.endDayOfWeek) ||
                (bookingEndDay >= schedule.startDayOfWeek || bookingEndDay <= schedule.endDayOfWeek);
        }

        if (!isBookingInScheduleDays) {
            return; // Skip this schedule if booking doesn't fall within its days
        }

        // For each day in the booking range, check if it falls within the schedule
        const currentDate = new Date(bookingStart);

        while (currentDate < bookingEnd) {
            const currentDay = convertToCustomDay(currentDate.getDay());
            let isInScheduleDays = false;

            if (schedule.startDayOfWeek <= schedule.endDayOfWeek) {
                isInScheduleDays = currentDay >= schedule.startDayOfWeek && currentDay <= schedule.endDayOfWeek;
            } else {
                isInScheduleDays = currentDay >= schedule.startDayOfWeek || currentDay <= schedule.endDayOfWeek;
            }

            if (isInScheduleDays) {
                // Create schedule start and end times for this day
                const scheduleStart = new Date(currentDate);
                const scheduleEnd = new Date(currentDate);

                scheduleStart.setHours(
                    parseInt(schedule.startTime.split(":")[0], 10),
                    parseInt(schedule.startTime.split(":")[1], 10),
                    0
                );

                scheduleEnd.setHours(
                    parseInt(schedule.endTime.split(":")[0], 10),
                    parseInt(schedule.endTime.split(":")[1], 10),
                    0
                );

                // If end time is before start time, it means it crosses midnight
                if (schedule.endTime < schedule.startTime) {
                    scheduleEnd.setDate(scheduleEnd.getDate() + 1);
                }

                // Find overlap between booking and schedule for this day
                const segmentStart = isBefore(bookingStart, scheduleStart) ? scheduleStart : bookingStart;
                const segmentEnd = isAfter(bookingEnd, scheduleEnd) ? scheduleEnd : bookingEnd;

                if (isBefore(segmentStart, segmentEnd)) {
                    const durationHours = differenceInMinutes(segmentEnd, segmentStart) / 60;

                    if (includePrice) {

                        // Adjust price based on priceType
                        totalPrice += calculatePriceByPriceType(
                            schedule.price,
                            schedule.priceType,
                            durationHours,
                            persons
                        );
                    }

                    if (includeExclusive) {
                        if (isExclusive &&
                            schedule.exclusiveType &&
                            schedule.exclusivePriceType &&
                            schedule.exclusivePrice) {
                            totalPrice += calculatePriceByPriceType(
                                schedule.exclusivePrice,
                                schedule.exclusivePriceType,
                                durationHours,
                                persons
                            );
                        }
                    }

                    coveredRanges.push({ start: segmentStart, end: segmentEnd });
                }
            }

            // Move to the next day
            currentDate.setDate(currentDate.getDate() + 1);
            currentDate.setHours(0, 0, 0, 0);
        }
    });

    // When no covered ranges and base price type is any fix type, return base price
    if (coveredRanges.length == 0) {
        if (!includePrice) {
            return 0;
        }

        if (basePriceType === "once" || basePriceType === "day") {
            // return basePrice + seating
            return basePrice +
                calculateSeating(totalPrice,
                    new Date(bookingStart),
                    bookingEnd,
                    persons,
                    seatings,
                    seating);
        }
        if (basePriceType === "none" || basePriceType === "consumption") {
            return 0;
        }
    }

    // Sort covered ranges by start time
    coveredRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Merge overlapping ranges
    const mergedRanges: { start: Date; end: Date }[] = [];
    for (const range of coveredRanges) {
        if (mergedRanges.length === 0) {
            mergedRanges.push(range);
            continue;
        }

        const lastRange = mergedRanges[mergedRanges.length - 1];
        if (isBefore(lastRange.end, range.start)) {
            // No overlap, add as new range
            mergedRanges.push(range);
        } else if (isBefore(lastRange.end, range.end)) {
            // Partial overlap, extend the last range
            lastRange.end = range.end;
        }
        // If range is completely contained in lastRange, do nothing
    }

    let unaccountedStart = new Date(bookingStart);

    // Calculate base price for uncovered time slots
    for (const range of mergedRanges) {
        if (isBefore(unaccountedStart, range.start)) {
            const durationHours = differenceInMinutes(range.start, unaccountedStart) / 60;
            if (includePrice) {
                let price = durationHours * basePrice;
                if (basePriceType === "person") {
                    price *= persons;
                }
                totalPrice += price;
            }
        }
        unaccountedStart = new Date(Math.max(unaccountedStart.getTime(), range.end.getTime()));
    }

    // If there's any remaining uncovered time, charge basePrice
    if (isBefore(unaccountedStart, bookingEnd)) {
        const durationHours = differenceInMinutes(bookingEnd, unaccountedStart) / 60;
        if (includePrice) {
            let price = durationHours * basePrice;
            if (basePriceType === "person") {
                price *= persons;
            }
            totalPrice += price;
        }
    }

    // Apply seating
    totalPrice += calculateSeating(totalPrice,
        unaccountedStart,
        bookingEnd,
        persons,
        seatings,
        seating);

    return totalPrice;
};

export const calculateSeating = (
    totalPrice: number,
    bookingStart: Date,
    bookingEnd: Date,
    persons: number,
    seatings?: BookingSeating[],
    seating?: string
) => {
    const seatingToApply = seating
        ? seatings?.find(s => s.seating === seating) || seatings?.find(s => s.isDefault) || null
        : null;

    if (seatingToApply) {
        const durationHours = differenceInMinutes(bookingEnd, bookingStart) / 60;

        const seatingBasePrice = seatingToApply.isAbsolute
            ? seatingToApply.price
            : totalPrice * (seatingToApply.price / 100);

        const seatingPrice = calculatePriceByPriceType(
            seatingBasePrice,
            seatingToApply.priceType,
            durationHours,
            persons
        );

        if (seatingToApply.reconfigPriceType != "none" &&
            seatingToApply.reconfigPrice &&
            seatingToApply.reconfigPriceType
        ) {
            const reconfigBasePrice = seatingToApply.reconfigIsAbsolute
                ? seatingToApply.reconfigPrice
                : totalPrice * (seatingToApply.reconfigPrice / 100);

            const reconfigPrice = calculatePriceByPriceType(
                reconfigBasePrice,
                seatingToApply.reconfigPriceType,
                durationHours,
                persons
            );

            return seatingPrice + reconfigPrice;
        } else {
            return seatingPrice;
        }
    }

    return 0;
}

export const doPricingSlotsOverlap = (pricing1: PricingSlot, pricing2: PricingSlot): boolean => {
    const referenceDate = new Date(2023, 0, 2); // Monday, Jan 2, 2023

    function getDate(dayOffset: number, time: string): Date {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() + dayOffset);
        const [h, m, s] = time.split(":").map(Number);
        date.setHours(h, m, s || 0);
        return date;
    }

    function normalizeSlot(start: Date, end: Date): [Date, Date] {
        if (isBefore(end, start)) {
            end = new Date(end);
            end.setDate(end.getDate() + 7); // wraps to next week
        }
        return [start, end];
    }

    function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
        return isBefore(aStart, bEnd) &&
            isBefore(bStart, aEnd) &&
            !isEqual(aEnd, bStart) &&
            !isEqual(bEnd, aStart);
    }

    const slot1Start = getDate(pricing1.startDayOfWeek, pricing1.startTime);
    const slot1End = getDate(pricing1.endDayOfWeek, pricing1.endTime);
    const slot2Start = getDate(pricing2.startDayOfWeek, pricing2.startTime);
    const slot2End = getDate(pricing2.endDayOfWeek, pricing2.endTime);

    const [s1Start, s1End] = normalizeSlot(slot1Start, slot1End);
    const [s2Start, s2End] = normalizeSlot(slot2Start, slot2End);

    // Check base overlap
    if (overlaps(s1Start, s1End, s2Start, s2End)) return true;

    // Check slot2 shifted 7 days forward (to account for wraparound vs slot1)
    const s2StartShifted = new Date(s2Start); s2StartShifted.setDate(s2Start.getDate() + 7);
    const s2EndShifted = new Date(s2End); s2EndShifted.setDate(s2End.getDate() + 7);
    if (overlaps(s1Start, s1End, s2StartShifted, s2EndShifted)) return true;

    // Check slot1 shifted 7 days forward (in case slot2 wraps and slot1 is earlier in week)
    const s1StartShifted = new Date(s1Start); s1StartShifted.setDate(s1Start.getDate() + 7);
    const s1EndShifted = new Date(s1End); s1EndShifted.setDate(s1End.getDate() + 7);
    if (overlaps(s1StartShifted, s1EndShifted, s2Start, s2End)) return true;

    return false;
};

export const getPricingSlotsForDates = (
    bookingStart: Date,
    bookingEnd: Date,
    schedules: PricingSlot[] // Added parameter to pass the pricing slots to check
): PricingSlot[] => {
    // Convert JS day (0=Sunday) to custom day (0=Monday)
    const convertToCustomDay = (jsDay: number): number => {
        return jsDay === 0 ? 6 : jsDay - 1;
    };

    const overlappingSlots: PricingSlot[] = [];

    // If no schedules provided or dates are invalid, return empty array
    if (!schedules || !bookingStart || !bookingEnd || isAfter(bookingStart, bookingEnd)) {
        return overlappingSlots;
    }

    schedules.forEach((schedule) => {
        const bookingStartDay = convertToCustomDay(bookingStart.getDay());
        const bookingEndDay = convertToCustomDay(bookingEnd.getDay());

        // Check if the schedule's days overlap with booking days
        let daysOverlap = false;
        if (schedule.startDayOfWeek <= schedule.endDayOfWeek) {
            // Same week schedule (e.g., Mon-Wed)
            daysOverlap =
                (bookingStartDay >= schedule.startDayOfWeek && bookingStartDay <= schedule.endDayOfWeek) ||
                (bookingEndDay >= schedule.startDayOfWeek && bookingEndDay <= schedule.endDayOfWeek) ||
                (bookingStartDay <= schedule.startDayOfWeek && bookingEndDay >= schedule.endDayOfWeek);
        } else {
            // Schedule wraps around week (e.g., Fri-Mon)
            daysOverlap =
                (bookingStartDay >= schedule.startDayOfWeek || bookingStartDay <= schedule.endDayOfWeek) ||
                (bookingEndDay >= schedule.startDayOfWeek || bookingEndDay <= schedule.endDayOfWeek) ||
                (bookingStartDay <= schedule.endDayOfWeek && bookingEndDay >= schedule.startDayOfWeek);
        }

        if (!daysOverlap) {
            return; // Skip if no day overlap
        }

        // Check each day in the booking range
        let currentDate = new Date(bookingStart);
        currentDate.setHours(0, 0, 0, 0); // Reset time to start of day

        while (isBefore(currentDate, bookingEnd) || currentDate.getTime() === bookingEnd.getTime()) {
            const currentDay = convertToCustomDay(currentDate.getDay());

            // Check if current day is within schedule's day range
            let isInScheduleDays = false;
            if (schedule.startDayOfWeek <= schedule.endDayOfWeek) {
                isInScheduleDays = currentDay >= schedule.startDayOfWeek && currentDay <= schedule.endDayOfWeek;
            } else {
                isInScheduleDays = currentDay >= schedule.startDayOfWeek || currentDay <= schedule.endDayOfWeek;
            }

            if (isInScheduleDays) {
                // Create schedule start and end times for this day
                const scheduleStart = new Date(currentDate);
                const scheduleEnd = new Date(currentDate);

                const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
                const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

                scheduleStart.setHours(startHour, startMinute, 0, 0);
                scheduleEnd.setHours(endHour, endMinute, 0, 0);

                // Handle overnight schedules
                if (schedule.endTime <= schedule.startTime) {
                    scheduleEnd.setDate(scheduleEnd.getDate() + 1);
                }

                // Check if there's a time overlap
                const hasOverlap =
                    (isBefore(bookingStart, scheduleEnd) && isAfter(bookingEnd, scheduleStart)) ||
                    (isBefore(scheduleStart, bookingEnd) && isAfter(scheduleEnd, bookingStart)) ||
                    (bookingStart.getTime() === scheduleStart.getTime() && bookingEnd.getTime() === scheduleEnd.getTime());

                if (hasOverlap) {
                    overlappingSlots.push(schedule);
                    break; // No need to check further days for this schedule
                }
            }

            currentDate = addDays(currentDate, 1);
        }
    });

    return overlappingSlots;
};
