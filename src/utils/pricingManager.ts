import { addDays, differenceInDays, differenceInMinutes, eachDayOfInterval, isAfter, isBefore, isEqual, startOfDay, set } from "date-fns";

export interface PriceItem {
    name: string;
    price: string;
};

export interface PricingSlot {
    roomPricingType: string;
    startDayOfWeek: number;
    startTime: string;  // 'HH:MM:SS'
    endDayOfWeek: number;
    endTime: string;    // 'HH:MM:SS'
    price: number;
    priceType: string;
    exclusiveType: string;
    exclusivePriceType: string | null;
    exclusivePrice: number | null;
    pricingLabel: string;
    exclusivePricingLabel?: string;
    customName?: string;
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
    name: string;
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

export interface BookingPriceProps {
    bookingStart: Date;
    bookingEnd: Date;
    persons: number;
    basePrice: number;
    basePriceType: string;
    basePriceLabel?: PricingLabels;
    isExclusive: boolean;
    includeExclusive?: boolean;
    seating?: string;
    schedules?: PricingSlot[];
    seatings?: BookingSeating[];
    context?: "admin" | "booker";
    short?: boolean;
    isSingleOperation: boolean;
}

export interface SeatingPriceProps {
    totalPrice: number;
    bookingStart: Date;
    bookingEnd: Date;
    persons: number;
    seatings?: BookingSeating[];
    seating?: string;
}

export type PriceTypes =
    "day" |
    "hour" |
    "person" |
    "personHour" |
    "once" |
    "none";

export const AvailablePriceTypes = [
    "day",
    "hour",
    "person",
    "personHour",
    "once",
    "none",
];

export const PricingLabel = {
    exact: "exact",
    from: "from",
    consumption: "consumption",
    minSales: "minSales"
} as const;

export type PricingLabels =
    typeof PricingLabel[keyof typeof PricingLabel];

export const AvailablePricingLabels = [
    "exact",
    "from",
    "consumption",
    "minSales",
];

export const AvailablePricingLabelsBasic = [
    "exact",
    "from",
];

const convertToCustomDay = (jsDay: number): number => {
    return jsDay === 0 ? 6 : jsDay - 1;
};

const calculatePriceByPriceType = (
    price: number,
    priceType: string,
    priceLabel: PricingLabels | null | undefined,
    startDate: Date,
    endDate: Date,
    persons: number | null,
    priceLabelFilter?: PricingLabels,
) => {
    if (priceLabelFilter && priceLabel === priceLabelFilter) {
        return 0;
    }

    const hours = differenceInMinutes(endDate, startDate) / 60;

    switch (priceType) {
        case "hour":
            //console.log("-- hour: ", hours, " --");
            return hours ? hours * price : 0;
        case "person":
            //console.log("-- person --");
            return persons ? persons * price : 0;
        case "personHour":
            //console.log("-- personHour --");
            return hours && persons ? hours * persons * price : 0;
        case "day":
            const days = eachDayOfInterval({ start: startDate, end: endDate });
            const uniqueDays = new Set(days.map(day => startOfDay(day).toISOString()));

            //console.log("-- days");
            //console.log("S ", startDate);
            //console.log("E ", endDate);
            //console.log("D ", uniqueDays.size);
            //console.log("days --");

            return uniqueDays.size ? uniqueDays.size * price : 0;
        case "once":
            //console.log("-- once --");
            return price;
        case "none":
        default:
            return 0;
    }
};

const getApplicableSlots = (
    bookingStart: Date,
    bookingEnd: Date,
    schedules?: PricingSlot[],
): { schedule: PricingSlot, segmentStart: Date, segmentEnd: Date }[] => {
    const applicableSlots: { schedule: PricingSlot, segmentStart: Date, segmentEnd: Date }[] = [];

    schedules?.forEach((schedule) => {
        // Check if schedule days overlap with booking days
        const bookingStartDay = convertToCustomDay(bookingStart.getDay());
        const bookingEndDay = convertToCustomDay(bookingEnd.getDay());

        let daysOverlap = false;
        if (schedule.startDayOfWeek <= schedule.endDayOfWeek) {
            daysOverlap =
                (bookingStartDay >= schedule.startDayOfWeek && bookingStartDay <= schedule.endDayOfWeek) ||
                (bookingEndDay >= schedule.startDayOfWeek && bookingEndDay <= schedule.endDayOfWeek) ||
                (bookingStartDay <= schedule.startDayOfWeek && bookingEndDay >= schedule.endDayOfWeek);
        } else {
            daysOverlap =
                (bookingStartDay >= schedule.startDayOfWeek || bookingStartDay <= schedule.endDayOfWeek) ||
                (bookingEndDay >= schedule.startDayOfWeek || bookingEndDay <= schedule.endDayOfWeek) ||
                (bookingStartDay <= schedule.endDayOfWeek && bookingEndDay >= schedule.startDayOfWeek);
        }

        if (!daysOverlap) return;

        // Calculate the schedule's full time range relative to bookingStart
        const weekStart = startOfDay(bookingStart);
        const startDayOffset = 0;//(convertToCustomDay(weekStart.getDay()) - schedule.startDayOfWeek + 7) % 7;
        const endDayOffset = (schedule.endDayOfWeek - convertToCustomDay(weekStart.getDay()) + 7) % 7;

        // Set schedule start
        let scheduleStart = new Date(weekStart);
        scheduleStart.setDate(weekStart.getDate() + startDayOffset);
        const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
        scheduleStart = set(scheduleStart, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });

        // Set schedule end
        let scheduleEnd = new Date(weekStart);
        scheduleEnd.setDate(weekStart.getDate() + endDayOffset);
        const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
        scheduleEnd = set(scheduleEnd, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });

        // Handle overnight schedules (same day, e.g., 8 PM to 2 AM)
        if (schedule.endTime <= schedule.startTime && schedule.startDayOfWeek === schedule.endDayOfWeek) {
            scheduleEnd.setDate(scheduleEnd.getDate() + 1);
        }

        // If schedule ends before it starts (e.g., wraps around week), adjust
        if (isBefore(scheduleEnd, scheduleStart)) {
            scheduleEnd.setDate(scheduleEnd.getDate() + 7);
        }

        //console.log("startDayOffset:", startDayOffset);
        //console.log("endDayOffset:", endDayOffset);
        //console.log("weekStart:", weekStart);
        //console.log("isBefore(bookingStart, scheduleStart):", isBefore(bookingStart, scheduleStart));

        //console.log("<-- Schedule Details -->");
        //console.log("Schedule ID:", (schedule as any).id);
        //console.log("Schedule Start:", scheduleStart);
        //console.log("Schedule End:", scheduleEnd);
        //console.log("Booking Start:", bookingStart);
        //console.log("Booking End:", bookingEnd);
        //console.log("-->");

        // Determine the overlapping segment
        const segmentStart = isBefore(bookingStart, scheduleStart) ? scheduleStart : bookingStart;
        const segmentEnd = isAfter(bookingEnd, scheduleEnd) ? scheduleEnd : bookingEnd;

        // Only process if there is a valid overlap
        if (isBefore(segmentStart, segmentEnd) || isEqual(segmentStart, segmentEnd)) {
            applicableSlots.push({ schedule, segmentStart, segmentEnd });
        }
    });

    return applicableSlots;
};

export const calculateBooking = (booking: Booking): {
    total: number;
    items: PriceItem[],
} => {
    const items: PriceItem[] = [];

    if (!booking.date || !booking.endDate) {
        return { total: 0, items };
    }

    const bookingStart = booking.date;
    const bookingEnd = booking.endDate;

    const persons = booking.persons ?? 1;

    // Collect all consumption, minSales

    const applicableSlots: {
        schedule: PricingSlot,
        segmentStart: Date,
        segmentEnd: Date
    }[] = [];

    booking.rooms?.forEach(room => {
        const slotsOfRoom = getApplicableSlots(
            bookingStart,
            bookingEnd,
            room.roomPricings);
        slotsOfRoom.forEach(slot => {
            applicableSlots.push(slot);
        })
    })

    const consumptionSlots = applicableSlots.filter(slot => {
        return slot.schedule.pricingLabel === "consumption";
    });

    const minSalesSlots = applicableSlots.filter(slot => {
        return slot.schedule.pricingLabel === "minSales";
    });

    const otherSlots = applicableSlots.filter(slot => {
        return !consumptionSlots.includes(slot) && !minSalesSlots.includes(slot);
    })

    //console.log("consumptionSlots", consumptionSlots);
    //console.log("minSalesSlots", minSalesSlots.length);
    //console.log("otherSlots", otherSlots);
    //console.log("all Slots", applicableSlots);

    let roomsPriceTotal = 0;

    booking.rooms?.forEach(room => {
        const extra = booking.roomExtras?.find(r => r.roomId === room.id);
        const isExclusive = extra?.isExclusive === true;
        const seating = extra?.seating;
        if (room) {
            const roomPrice = calculateBookingPrice({
                bookingStart,
                bookingEnd,
                persons,
                basePrice: room.price,
                basePriceType: room.priceType,
                isExclusive,
                schedules: otherSlots.map(slot => slot.schedule),
                seatings: room.roomSeatings,
                seating,
                isSingleOperation: false,
            });

            roomPrice.appliedSlots.forEach(slot => {
                //console.log("slot pricingLabel", slot.pricingLabel);
            });

            items.push({
                name: room.id.toString(),
                price: FormatPrice.formatPriceValue(roomPrice.total),
            });

            roomsPriceTotal += roomPrice.total;
        }
    });

    let packagesPrice = 0;
    if (booking.packages) {
        booking.packages.forEach(p => {
            packagesPrice += calculatePriceByPriceType(
                p.price,
                p.priceType as PriceTypes,
                null,
                bookingStart,
                bookingEnd,
                persons,
            );
        });
    }

    return {
        total: roomsPriceTotal + packagesPrice,
        items,
    };
}

const getMaxConsumption = (
    price: number,
    oldConsumption: number,
    pricingLabel?: PricingLabels
) => {
    if (pricingLabel === "consumption" && price > oldConsumption) {
        return price;
    }
    return oldConsumption;
}

const getMaxMinSales = (
    price: number,
    oldMinSales: number,
    pricingLabel?: PricingLabels
) => {
    if (pricingLabel === "minSales" && price > oldMinSales) {
        return price;
    }
    return oldMinSales;
}

export const calculateBookingPrice = ({
    bookingStart,
    bookingEnd,
    persons,
    basePrice,
    basePriceType,
    basePriceLabel,
    isExclusive,
    includeExclusive,
    seating,
    schedules,
    seatings,
    context,
    short,
    isSingleOperation,
}: BookingPriceProps): {
    total: number;
    totalFormatted: string
    items: PriceItem[],
    appliedSlots: PricingSlot[]
} => {
    let totalPrice = 0;
    const items: PriceItem[] = [];
    const appliedSlots: PricingSlot[] = [];

    const includePrice = true;

    const basicRanges: { start: Date; end: Date }[] = [];
    const extraRanges: { start: Date; end: Date; price: number }[] = [];

    let maxMinConsumtion = 0;
    let maxMinSales = 0;

    const applicableSlots = getApplicableSlots(bookingStart, bookingEnd, schedules);

    //console.log("applicableSlots", basePrice, applicableSlots);

    applicableSlots.forEach(slot => {
        const schedule = slot.schedule;
        const segmentStart = slot.segmentStart;
        const segmentEnd = slot.segmentEnd;

        if (includePrice) {
            const price = calculatePriceByPriceType(
                schedule.price,
                schedule.priceType,
                schedule.pricingLabel as PricingLabels,
                segmentStart,
                segmentEnd,
                persons,
            );

            totalPrice += price;

            items.push({
                name: schedule.roomPricingType === "basic"
                    ? "Grundpreis"
                    : schedule.customName || "Extra-Leistung",
                price: FormatPrice.formatPriceValue(price)
            });

            if (schedule.roomPricingType === "extra") {
                extraRanges.push({ start: segmentStart, end: segmentEnd, price });
            }

            maxMinConsumtion = getMaxConsumption(price, maxMinConsumtion, schedule.pricingLabel as PricingLabels);
            maxMinSales = getMaxMinSales(price, maxMinSales, schedule.pricingLabel as PricingLabels);

            console.log("items", schedule.price, price, schedule);
        }

        // Add exclusive price
        if (
            includeExclusive === true &&
            schedule.roomPricingType === "basic" &&
            isExclusive &&
            schedule.exclusiveType &&
            schedule.exclusivePriceType &&
            schedule.exclusivePrice
        ) {
            const exclusive = calculatePriceByPriceType(
                schedule.exclusivePrice,
                schedule.exclusivePriceType,
                schedule.pricingLabel as PricingLabels,
                segmentStart,
                segmentEnd,
                persons,
            );

            totalPrice += exclusive;

            items.push({
                name: "Exklusivität",
                price: FormatPrice.formatPriceValue(exclusive)
            });
        }

        if (schedule.roomPricingType === "basic") {
            basicRanges.push({ start: segmentStart, end: segmentEnd });
        }
    });

    // No ranges from schedules -> return base prices
    if (basicRanges.length === 0 && extraRanges.length === 0) {
        if (!includePrice) return {
            total: 0,
            totalFormatted: FormatPrice.formatPriceValue(0),
            items,
            appliedSlots
        };

        const p = calculatePriceByPriceType(
            basePrice,
            basePriceType,
            basePriceLabel,
            bookingStart,
            bookingEnd,
            persons,
        );

        items.push({
            name: "Grundpreis",
            price: FormatPrice.formatPriceValue(p)
        });

        const minConsumption = calculatePriceByPriceType(
            basePrice,
            basePriceType,
            basePriceLabel,
            bookingStart,
            bookingEnd,
            persons,
            PricingLabel.consumption,
        );

        const minSales = calculatePriceByPriceType(
            basePrice,
            basePriceType,
            basePriceLabel,
            bookingStart,
            bookingEnd,
            persons,
            PricingLabel.minSales,
        );

        maxMinConsumtion = getMaxConsumption(minConsumption, maxMinConsumtion, basePriceLabel);
        maxMinSales = getMaxMinSales(minSales, maxMinSales, basePriceLabel);

        const s = calculateSeating({
            totalPrice: basePrice,
            bookingStart,
            bookingEnd,
            persons,
            seatings,
            seating,
        });

        items.push(...s.items);

        const total = p + s.total;

        console.log("s", seating ?? "no", seatings);

        if (isSingleOperation) {
            if (maxMinSales > 0 || maxMinConsumtion > 0) {
                const totalWithConsumption = maxMinConsumtion + total;
                if (totalWithConsumption > maxMinSales) {
                    return {
                        total: totalWithConsumption,
                        totalFormatted: FormatPrice.formatPriceWithCustomText(
                            totalWithConsumption,
                            FormatPrice.translate("consumption")
                        ),
                        items,
                        appliedSlots
                    };
                }

                return {
                    total: maxMinSales,
                    totalFormatted: FormatPrice.formatPriceWithCustomText(
                        maxMinSales,
                        FormatPrice.translate("minSales")
                    ),
                    items,
                    appliedSlots
                };
            }
        }

        return {
            total: total,
            totalFormatted: FormatPrice.formatPriceWithType({
                price: total,
                pricingLabel: basePriceLabel as PricingLabels,
                context,
                short: short === true,
                noneLabelKey: "free"
            }),
            items,
            appliedSlots
        };
    }

    // Sort and merge only basic ranges
    basicRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

    const mergedBasicRanges: { start: Date; end: Date }[] = [];

    for (const range of basicRanges) {
        if (mergedBasicRanges.length === 0) {
            mergedBasicRanges.push(range);
            continue;
        }

        const lastRange = mergedBasicRanges[mergedBasicRanges.length - 1];

        if (isBefore(lastRange.end, range.start)) {
            mergedBasicRanges.push(range);
        } else if (isBefore(lastRange.end, range.end)) {
            lastRange.end = range.end;
        }
    }

    if (includePrice) {
        let unaccountedStart = bookingStart;

        // Time periods that are covered by ranges
        for (const range of mergedBasicRanges) {
            if (isBefore(unaccountedStart, range.start)) {
                console.log("UNCOVERED RANGES BEFORE!!!");
                const price = calculatePriceByPriceType(
                    basePrice,
                    basePriceType,
                    basePriceLabel,
                    unaccountedStart,
                    range.start,
                    persons,
                );
                totalPrice += price;
            }
            unaccountedStart = new Date(Math.max(unaccountedStart.getTime(), range.end.getTime()));
        }

        // Remaining time period, not covered by ranges
        if (isBefore(unaccountedStart, bookingEnd)) {
            console.log("UNCOVERED RANGES AFTER!!!");
            const price = calculatePriceByPriceType(
                basePrice,
                basePriceType,
                basePriceLabel,
                unaccountedStart,
                bookingEnd,
                persons,
            );

            totalPrice += price;

            items.push({
                name: "Grundpreis",
                price: FormatPrice.formatPriceWithType(
                    {
                        price,
                        priceType: basePriceType as PriceTypes,
                    }
                )
            });
        }
    }

    const seatingPrices = calculateSeating({
        totalPrice,
        bookingStart,
        bookingEnd,
        persons,
        seatings,
        seating,
    });

    totalPrice += seatingPrices.total;
    items.push(...seatingPrices.items);

    return {
        total: totalPrice,
        totalFormatted: FormatPrice.formatPriceValue(totalPrice),
        items,
        appliedSlots
    };
};

export const calculateSeating = ({
    totalPrice,
    bookingStart,
    bookingEnd,
    persons,
    seatings,
    seating,
}: SeatingPriceProps): { total: number; items: PriceItem[] } => {
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
            null,
            bookingStart,
            bookingEnd,
            persons,
        );

        if (seatingToApply.reconfigPriceType != "none" &&
            seatingToApply.reconfigPrice &&
            seatingToApply.reconfigPriceType
        ) {
            const reconfigBasePrice = seatingToApply.reconfigIsAbsolute
                ? seatingToApply.reconfigPrice
                : seatingPrice * (seatingToApply.reconfigPrice / 100);

            const reconfigPrice = calculatePriceByPriceType(
                reconfigBasePrice,
                seatingToApply.reconfigPriceType,
                null,
                bookingStart,
                bookingEnd,
                persons,
            );

            return {
                total: seatingPrice + reconfigPrice,
                items: [{
                    name: "Seating",
                    price: FormatPrice.formatPriceValue(seatingPrice + reconfigPrice)
                }]
            };

        }

        return {
            total: seatingPrice,
            items: [{
                name: "Seating",
                price: FormatPrice.formatPriceValue(seatingPrice)
            }]
        };
    }

    return { total: 0, items: [] };
}

export const doPricingSlotsOverlap = (pricing1: PricingSlot, pricing2: PricingSlot): boolean => {
    if (!(pricing1.roomPricingType == "basic" && pricing2.roomPricingType == "basic")) {
        return false;
    }

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

export interface FormatPriceOptions {
    price: number,
    priceType?: PriceTypes,
    pricingLabel?: PricingLabels
    short?: boolean;
    context?: "admin" | "booker";
    noneLabelKey?: "none" | "free";
}

export interface TranslateOptions {
    short?: boolean;
    context?: "admin" | "booker";
    noneLabelKey?: "none" | "free";
}

export class FormatPrice {
    static staticTranslations = {
        "day": "pro Tag",
        "once": "pro Event",
        "hour": "pro Stunde",
        "person": "pro Person",
        "personHour": "pro Person/Stunde",
        "consumption": "Mindestverzehr",
        "none": "inklusive",
        "exact": "Pauschale (fix)",
        "from": "Verbrauchspreis (ab)",
        "minSales": "Mindestumsatz",
        "free": "kostenlos",
    } as const;

    static staticShortTranslations = {
        "day": "p. Tag",
        "once": "p. Event",
        "hour": "p. Stunde",
        "person": "p. Person",
        "personHour": "p. Person/h",
        "consumption": "Mindestverzehr",
        "none": "inklusive",
        "exact": "Pauschale (fix)",
        "from": "ab",
        "minSales": "Mindestumsatz",
        "free": "kostenlos",
    } as const;

    static formatPriceValue(price: number): string {
        return new Intl.NumberFormat('de-DE', {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    }

    static formatPriceValueWithPrefix(
        price: number,
        prefix?: string,
        short: boolean = false
    ): string {
        const strPrice = FormatPrice.formatPriceValue(price);

        const t = short === true
            ? FormatPrice.staticShortTranslations
            : FormatPrice.staticTranslations;

        if (prefix && prefix !== "exact") {
            return `${t[prefix as keyof typeof t]} ${strPrice}`;
        }

        return strPrice;
    }

    static formatPriceWithType(options: FormatPriceOptions): string {
        const t = options.short === true
            ? FormatPrice.staticShortTranslations
            : FormatPrice.staticTranslations;

        if (options.price === 0) {
            return t[options.noneLabelKey ?? "none"];
        }

        if (options.priceType === "none") {
            return t[options.noneLabelKey ?? "none"];
        }

        const priceWithPrefix = FormatPrice.formatPriceValueWithPrefix(
            options.price,
            options.pricingLabel,
            options.short
        );

        if (!options.priceType || options.priceType.length === 0) {
            return priceWithPrefix;
        }

        return `${priceWithPrefix} ${t[options.priceType]}`;
    }

    static formatPriceWithCustomText(
        price: number,
        text: string,
    ): string {
        const strPrice = FormatPrice.formatPriceValue(price);
        return `${text} ${strPrice}`;
    }

    static translatePrices(values: PriceTypes[]): string {
        if (!values || values.length === 0) {
            return "-";
        }

        const translated = values.map((key) => {
            return FormatPrice.staticTranslations[key];
        });

        return translated.join(", ");
    }

    static translatePrice(
        value: PriceTypes,
        options?: TranslateOptions
    ): string {
        if (!value || value.length === 0) {
            return "-";
        }

        const t = options?.short === true
            ? FormatPrice.staticShortTranslations
            : FormatPrice.staticTranslations;

        if (value === "none") {
            return t[options?.noneLabelKey ?? "none"];
        }

        return t[value];
    }

    static translatePricingLabel(
        value: PricingLabels,
        options?: TranslateOptions
    ): string {
        if (!value || value.length === 0) {
            return "-";
        }

        const t = options?.short === true
            ? FormatPrice.staticShortTranslations
            : FormatPrice.staticTranslations;

        return t[value];
    }

    static translate(key: string): string {
        return FormatPrice
            .staticTranslations[key as keyof typeof FormatPrice.staticTranslations]
            ?? key;
    }
}
