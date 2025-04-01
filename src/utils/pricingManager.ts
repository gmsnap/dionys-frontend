import { addDays, differenceInMinutes, isAfter, isBefore } from "date-fns";

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

export interface BookingRoom {
    id: number;
    price: number;
    priceType: string;
    minPersons: number;
    maxPersons: number;
    roomPricings?: PricingSlot[];
};

export interface BookingPackage {
    id: number;
    price: number;
    priceType: string;
    minPersons: number;
    maxPersons: number;
};

export interface Booking {
    id: number;
    persons: number;
    date: number;
    endDate: number;
    room?: BookingRoom;
    packages?: BookingPackage[];
    rooms?: BookingRoom[];
    roomExclusiveIds?: number[];
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

export const calculateBooking = (booking: Booking) => {
    let diffInHours = 0;
    if (!booking.date || !booking.endDate) {
        return 0;
    }

    const date = new Date(booking.date);
    const endDate = new Date(booking.endDate);

    const diffInMs = endDate.getTime() - date.getTime();
    diffInHours = diffInMs / (1000 * 60 * 60);

    const persons = booking.persons ?? 1;

    console.log("booking.roomExclusiveIds?.includes(room.id)", booking.roomExclusiveIds)

    const roomsPrice = booking.rooms?.reduce((total, room) => {
        const roomPrice = room
            ? calculateBookingPrice(
                date,
                endDate,
                persons,
                room.price,
                room.priceType,
                booking.roomExclusiveIds?.includes(room.id) === true,
                room.roomPricings
            )
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

export const calculateBookingPrice = (
    bookingStart: Date,
    bookingEnd: Date,
    persons: number = 1,
    basePrice: number,
    basePriceType: string,
    isExclusive: boolean,
    schedules?: PricingSlot[],
    filters?: string[],
) => {
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
                        if (schedule.priceType === "hour") {
                            totalPrice += durationHours * schedule.price;
                        } else if (schedule.priceType === "person") {
                            totalPrice += durationHours * persons * schedule.price;
                        } else if (schedule.priceType === "once") {
                            totalPrice += schedule.price;
                        }
                    }

                    if (includeExclusive) {
                        if (isExclusive &&
                            schedule.exclusiveType !== "none" &&
                            schedule.exclusivePrice) {
                            if (schedule.exclusivePriceType === "hour") {
                                totalPrice += durationHours * schedule.exclusivePrice;
                            } else if (schedule.exclusivePriceType === "person") {
                                totalPrice += durationHours * persons * schedule.exclusivePrice;
                            } else if (schedule.exclusivePriceType === "once") {
                                totalPrice += schedule.exclusivePrice;
                            }
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
            return basePrice;
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

    return totalPrice;
};

export const doPricingSlotsOverlap = (pricing1: PricingSlot, pricing2: PricingSlot): boolean => {
    // Convert times to comparable Date objects (same reference day)
    const referenceDate = new Date(2023, 0, 1); // Using a fixed date (Jan 1, 2023, Sunday)

    const pricing1Start = new Date(referenceDate);
    pricing1Start.setDate(referenceDate.getDate() + pricing1.startDayOfWeek);
    const [startHour1, startMinute1, startSecond1] = pricing1.startTime.split(":").map(Number);
    pricing1Start.setHours(startHour1, startMinute1, startSecond1 || 0);

    const pricing1End = new Date(referenceDate);
    pricing1End.setDate(referenceDate.getDate() + pricing1.endDayOfWeek);
    const [endHour1, endMinute1, endSecond1] = pricing1.endTime.split(":").map(Number);
    pricing1End.setHours(endHour1, endMinute1, endSecond1 || 0);

    const pricing2Start = new Date(referenceDate);
    pricing2Start.setDate(referenceDate.getDate() + pricing2.startDayOfWeek);
    const [startHour2, startMinute2, startSecond2] = pricing2.startTime.split(":").map(Number);
    pricing2Start.setHours(startHour2, startMinute2, startSecond2 || 0);

    const pricing2End = new Date(referenceDate);
    pricing2End.setDate(referenceDate.getDate() + pricing2.endDayOfWeek);
    const [endHour2, endMinute2, endSecond2] = pricing2.endTime.split(":").map(Number);
    pricing2End.setHours(endHour2, endMinute2, endSecond2 || 0);

    // Ensure pricing1Start <= pricing1End (handles overnight periods)
    if (isAfter(pricing1Start, pricing1End)) {
        pricing1End.setDate(pricing1End.getDate() + 1);
    }

    // Ensure pricing2Start <= pricing2End (handles overnight periods)
    if (isAfter(pricing2Start, pricing2End)) {
        pricing2End.setDate(pricing2End.getDate() + 1);
    }

    // Check if they overlap (but allow touching at edges)
    return isBefore(pricing1Start, pricing2End) && isBefore(pricing2Start, pricing1End) &&
        !(pricing1End.getTime() === pricing2Start.getTime() || pricing2End.getTime() === pricing1Start.getTime());
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
