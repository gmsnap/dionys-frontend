import { addDays, differenceInMinutes, isAfter, isBefore } from "date-fns";

interface PricingSlot {
    startDayOfWeek: number;
    startTime: string;  // 'HH:MM:SS'
    endDayOfWeek: number;
    endTime: string;    // 'HH:MM:SS'
    price: number;
    priceType: string;
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

    const roomsPrice = booking.rooms?.reduce((total, room) => {
        const roomPrice = room
            ? calculateBookingPrice(
                date,
                endDate,
                persons,
                room.price,
                room.priceType,
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

    //console.log("booking.packages", booking.packages)

    return roomsPrice + packagePrice;
}

export const calculateBookingPrice = (
    bookingStart: Date,
    bookingEnd: Date,
    persons: number = 1,
    basePrice: number,
    basePriceType: string,
    schedules?: PricingSlot[],
) => {
    //console.log("start", bookingStart, "end", bookingEnd);

    let totalPrice = 0;
    let coveredRanges: { start: Date; end: Date }[] = [];

    // Loop through schedules and apply pricing where applicable
    schedules?.forEach((schedule) => {
        let scheduleStart = new Date(bookingStart);
        let scheduleEnd = new Date(bookingStart);

        const bookingStartDay = bookingStart.getDay(); // 0 = Sunday, 6 = Saturday

        // Adjust schedule dates based on `startDayOfWeek` and `endDayOfWeek`
        const dayDifferenceStart = (schedule.startDayOfWeek - bookingStartDay + 7) % 7;
        const dayDifferenceEnd = (schedule.endDayOfWeek - bookingStartDay + 7) % 7;

        scheduleStart = addDays(scheduleStart, dayDifferenceStart);
        scheduleEnd = addDays(scheduleEnd, dayDifferenceEnd);

        // Set hours & minutes for the schedule
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

        // If the end time is before the start time, it means it crosses midnight
        if (schedule.endDayOfWeek < schedule.startDayOfWeek ||
            (schedule.endDayOfWeek === schedule.startDayOfWeek && schedule.endTime < schedule.startTime)) {
            scheduleEnd = addDays(scheduleEnd, 1);
        }

        // Find overlap between booking and schedule
        const segmentStart = isBefore(bookingStart, scheduleStart) ? scheduleStart : bookingStart;
        const segmentEnd = isAfter(bookingEnd, scheduleEnd) ? scheduleEnd : bookingEnd;

        if (isBefore(segmentStart, segmentEnd)) {
            const durationHours = differenceInMinutes(segmentEnd, segmentStart) / 60;
            let price = schedule.price;

            // Adjust price based on priceType
            if (schedule.priceType === "person") {
                price *= persons;
            }

            totalPrice += durationHours * price;
            coveredRanges.push({ start: segmentStart, end: segmentEnd });
        }
    });

    // Sort covered ranges by start time
    coveredRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

    let unaccountedStart = bookingStart;

    // Calculate base price for uncovered time slots
    for (const range of coveredRanges) {
        if (isBefore(unaccountedStart, range.start)) {
            const durationHours = differenceInMinutes(range.start, unaccountedStart) / 60;
            let price = durationHours * basePrice;
            if (basePriceType === "person") {
                price *= persons;
            }
            totalPrice += price;
        }
        unaccountedStart = range.end;
    }

    // If there's any remaining uncovered time, charge basePrice
    if (isBefore(unaccountedStart, bookingEnd)) {
        const durationHours = differenceInMinutes(bookingEnd, unaccountedStart) / 60;
        let price = durationHours * basePrice;
        if (basePriceType === "person") {
            price *= persons;
        }
        totalPrice += price;
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
