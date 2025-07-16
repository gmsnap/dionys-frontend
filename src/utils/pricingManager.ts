import {
    addDays,
    differenceInMinutes,
    eachDayOfInterval,
    isAfter,
    isBefore,
    isEqual,
    startOfDay,
    set
} from "date-fns";

export interface PriceItem {
    id: number;
    name: string;
    itemType: string;
    price: number;
    pricingLabel?: string;
    priceFormatted: string;
    quantity: number;
    unitPrice: number;
    unitPriceFormatted: string;
    pos?: number;
    items?: PriceItem[];
    source?: object;
};

export interface PricingSlot {
    id: number;
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
    pricingLabel: string;
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
    pricingLabel: PricingLabels;
    minPersons: number;
    maxPersons: number;
    roomPricings?: PricingSlot[];
    roomSeatings?: BookingSeating[];
};

export interface BookingPackage {
    id: number;
    name: string;
    packageCategory: string;
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

export interface BookingResult {
    items: PriceItem[];
    total: number;
};

export interface BookingPriceProps {
    bookingStart: Date;
    bookingEnd: Date;
    persons: number;
    basePrice: number;
    basePriceType: string;
    basePriceLabel?: PricingLabels;
    excludeRoomPrice?: boolean;
    excludeExclusive?: boolean;
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

export const AvailableFoodPriceTypes = [
    "day",
    "hour",
    "person",
    "personHour",
    "once",
    "onConsumption",
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
    startDate: Date,
    endDate: Date,
    persons: number,
) => {
    const hours = differenceInMinutes(endDate, startDate) / 60;

    switch (priceType) {
        case "hour":
            //console.log("-- hour: ", hours, " --");
            return hours ? hours * price : 0;
        case "person":
            //console.log("-- person --");
            return persons * price;
        case "personHour":
            //console.log("-- personHour --");
            return hours * persons * price;
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

const calculateUnitQuantity = (
    priceType: string,
    persons: number,
): number => {
    switch (priceType) {
        case "hour":
            return 1;
        case "person":
            return persons;
        case "personHour":
            return persons;
        case "day":
            return 1;
        case "once":
            return 1;
        case "none":
        default:
            return 1;
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

export const calculateBooking = (booking: Booking): BookingResult => {
    const items: PriceItem[] = [];

    if (!booking.date || !booking.endDate) {
        return { total: 0, items };
    }

    const bookingStart = booking.date;
    const bookingEnd = booking.endDate;

    const persons = booking.persons;

    let pos = 0;
    let maxMinConsumption = 0;
    let maxMinSales = 0;

    // ROOMS

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
    });

    let roomsPriceOtherTotal = 0;

    booking.rooms?.forEach(room => {
        const extra = booking.roomExtras?.find(r => r.roomId === room.id);
        const excludeExclusive = extra?.isExclusive !== true;
        const seating = extra?.seating;
        if (room) {
            const roomResult = calculateBookingPrice({
                bookingStart,
                bookingEnd,
                persons,
                basePrice: room.price,
                basePriceType: room.priceType,
                basePriceLabel: room.pricingLabel,
                schedules: applicableSlots.map(slot => slot.schedule),
                excludeExclusive,
                seatings: room.roomSeatings,
                seating,
                isSingleOperation: false,
            });

            roomResult.items = roomResult.items.map(item => ({
                ...item,
                pos: ++pos,
            }));

            items.push({
                id: room.id,
                name: room.name,
                itemType: "room",
                price: roomResult.total,
                priceFormatted: FormatPrice.formatPriceValue(roomResult.total),
                quantity: 1,
                unitPrice: 0,
                unitPriceFormatted: "-",
                items: roomResult.items,
            });

            roomsPriceOtherTotal += roomResult.total;
            maxMinConsumption = Math.max(
                maxMinConsumption,
                roomResult.maxMinConsumption);
            maxMinSales = Math.max(maxMinSales, roomResult.maxMinSales);
        }
    });

    let bookedConsumption = 0;
    let bookedEquipment = 0;

    // PACKAGES

    if (booking.packages) {
        booking.packages.forEach(p => {
            const packagePrice = calculatePriceByPriceType(
                p.price,
                p.priceType as PriceTypes,
                bookingStart,
                bookingEnd,
                persons,
            );

            if (p.packageCategory === "catering") {
                bookedConsumption += packagePrice;
            } else if (p.packageCategory === "equipment") {
                bookedEquipment += packagePrice;
            }

            items.push({
                id: p.id,
                name: p.name,
                itemType: p.packageCategory,
                price: packagePrice,
                priceFormatted: FormatPrice.formatPriceValue(packagePrice),
                quantity: calculateUnitQuantity(p.priceType, persons),
                unitPrice: p.price,
                unitPriceFormatted: FormatPrice.formatPriceWithType(
                    { price: p.price, noneLabelKey: "free" }
                ),
                pos: ++pos,
            });
        });
    }

    console.log("-- calculateBooking");
    console.log("roomsPriceOtherTotal", roomsPriceOtherTotal);
    console.log("required consumption", maxMinConsumption);
    console.log("bookedConsumption", bookedConsumption);
    console.log("bookedEquipment", bookedEquipment);
    console.log("items", items);
    console.log("calculateBooking --");

    // Apply min spendings (if any)
    if (maxMinConsumption > 0 || maxMinSales > 0) {

        // 1. Consumption > min sales -> calculate with consumption
        if (maxMinConsumption > maxMinSales) {

            // Distribute uncovered consumption evenly across rooms
            const consumptionItems = items
                .filter(i => i.itemType === "room")
                .flatMap(i => i.items)
                .filter(i => i != undefined && i.pricingLabel === "consumption");

            const diff = maxMinConsumption - bookedConsumption;

            const share = diff > 0
                ? Math.round(diff / consumptionItems.length)
                : 0;

            consumptionItems
                .filter(i => i != undefined)
                .forEach(i => {
                    i.price = share;
                    i.priceFormatted = share > 0
                        ? FormatPrice.formatPriceWithType({ price: share })
                        : FormatPrice.formatPriceValue(share);
                });

            return {
                total:
                    Math.max(maxMinConsumption, bookedConsumption)
                    + roomsPriceOtherTotal
                    + bookedEquipment,
                items,
            };
        }

        // 2. Calculate with min sales

        // Distribute uncovered consumption evenly across rooms
        const minSalesItems = items
            .filter(i => i.itemType === "room")
            .flatMap(i => i.items)
            .filter(i => i != undefined && i.pricingLabel === "minSales");

        const diff =
            maxMinSales
            - bookedConsumption
            - bookedEquipment
            - roomsPriceOtherTotal;

        const share = diff > 0
            ? Math.round(diff / minSalesItems.length)
            : 0;

        minSalesItems
            .filter(i => i != undefined)
            .forEach(i => {
                i.price = share;
                i.priceFormatted = share > 0
                    ? FormatPrice.formatPriceWithType({ price: share })
                    : FormatPrice.formatPriceValue(share);
            });

        return {
            total:
                Math.max(
                    maxMinSales,
                    bookedConsumption
                    + bookedEquipment
                    + roomsPriceOtherTotal
                ),
            items,
        }
    }

    return {
        total: roomsPriceOtherTotal + bookedConsumption + bookedEquipment,
        items,
    };
}

const calculateSlots = (
    slots: {
        schedule: PricingSlot,
        segmentStart: Date,
        segmentEnd: Date
    }[],
    props: {
        bookingStart: Date,
        bookingEnd: Date,
        persons: number,
        excludeRoomPrice?: boolean,
        excludeExclusive?: boolean,
        seating?: string,
        seatings?: BookingSeating[],
        isSingleOperation: boolean,
        context?: "admin" | "booker",
        short?: boolean,
    },
) => {
    const items: PriceItem[] = [];

    let totalOtherPrice = 0;
    let maxMinConsumption = 0;
    let maxMinSales = 0;

    let totalFormatted: string | null | undefined = undefined;

    slots.forEach(slot => {
        const schedule = slot.schedule;
        const segmentStart = slot.segmentStart;
        const segmentEnd = slot.segmentEnd;
        const price = schedule.price;
        const priceType = schedule.priceType;
        const pricingLabel = schedule.pricingLabel;
        const roomPricingType = schedule.roomPricingType

        // calculate segment

        const p = props.excludeRoomPrice === true
            ? 0
            : calculatePriceByPriceType(
                price,
                priceType,
                segmentStart,
                segmentEnd,
                props.persons,
            );

        let otherPrice = 0;
        let minConsumption = 0;
        let minSales = 0;

        switch (pricingLabel) {
            case PricingLabel.consumption:
                minConsumption = p;
                break;
            case PricingLabel.minSales:
                minSales = p;
                break;
            default:
                otherPrice = p;
        }

        const itemName =
            minConsumption > 0 || minSales > 0
                ? minConsumption > minSales
                    ? FormatPrice.translate("consumption", props.short)
                    : FormatPrice.translate("minSales", props.short)
                : FormatPrice.translate(
                    "pricing_" + schedule.roomPricingType,
                    props.short)

        // Add base price item
        items.push({
            id: schedule.id,
            name: itemName,
            itemType: schedule.roomPricingType,
            price: p,
            pricingLabel,
            quantity: 1,
            unitPrice: p,
            priceFormatted: FormatPrice.formatPriceValue(p),
            unitPriceFormatted: FormatPrice.formatPriceValue(p),
        });

        // Add exclusive price
        if (
            props.excludeExclusive !== true &&
            roomPricingType === "basic" &&
            schedule.exclusivePrice &&
            schedule.exclusivePriceType
        ) {
            const exclusive = calculatePriceByPriceType(
                schedule.exclusivePrice,
                schedule.exclusivePriceType,
                segmentStart,
                segmentEnd,
                props.persons,
            );

            otherPrice += exclusive;

            items.push({
                id: schedule.id,
                name: "Exklusivität",
                itemType: "exclusivity",
                price: exclusive,
                quantity: 1,
                unitPrice: schedule.exclusivePrice,
                pricingLabel: schedule.exclusivePricingLabel,
                priceFormatted: FormatPrice.formatPriceWithType(
                    { price: exclusive, noneLabelKey: "none" }
                ),
                unitPriceFormatted: FormatPrice.formatPriceWithType(
                    { price: exclusive, noneLabelKey: "none" }
                ),
            });
        }

        maxMinConsumption = Math.max(minConsumption, maxMinConsumption);
        maxMinSales = Math.max(minSales, maxMinSales);

        totalOtherPrice += otherPrice;

        if (totalFormatted === undefined) {
            totalFormatted = totalFormatted;
        } else {
            totalFormatted = null;
        }
    }); // End slots loop

    // Add seating

    const baseValueForSeating = Math.max(
        totalOtherPrice + maxMinConsumption,
        maxMinSales > 0 ? Math.max(maxMinSales, totalOtherPrice) : 0,
    );

    const calculatedSeating = calculateSeating({
        totalPrice: baseValueForSeating,
        bookingStart: props.bookingStart,
        bookingEnd: props.bookingEnd,
        persons: props.persons,
        seatings: props.seatings,
        seating: props.seating,
    });

    /*console.log(
        "totalOtherPrice", totalOtherPrice,
        "calculatedSeating", calculatedSeating.total,
        "baseValueForSeating", baseValueForSeating,
        "maxMinConsumption", maxMinConsumption,);*/

    items.push(...calculatedSeating.items);

    const totalOtherWithSeating = totalOtherPrice + calculatedSeating.total;

    // Single operation -> apply min spendings directly
    if (props.isSingleOperation) {
        // Min spendings found
        if (maxMinSales > 0 || maxMinConsumption > 0) {

            // consumption > min sales
            if (maxMinConsumption > maxMinSales) {
                /*console.log("totalOtherPrice", totalOtherPrice,
                    "totalOtherWithSeating", totalOtherWithSeating,
                    "maxMinConsumption", maxMinConsumption,);*/
                const displayPrice = maxMinConsumption + totalOtherWithSeating;
                return {
                    total: displayPrice,
                    totalFormatted: FormatPrice.formatPriceWithCustomText(
                        displayPrice,
                        totalOtherWithSeating > 0
                            ? `(inkl. ${maxMinConsumption} ${FormatPrice.translate("consumption")})`
                            : FormatPrice.translate("consumption"),
                        true
                    ),
                    items,
                    maxMinConsumption,
                    maxMinSales,
                    seatingTotal: calculatedSeating.total
                };
            }

            // consumption < min sales
            const exceedsMinSales = totalOtherWithSeating > maxMinSales;
            return {
                total: exceedsMinSales ? maxMinSales + totalOtherWithSeating : maxMinSales,
                totalFormatted: FormatPrice.formatPriceWithCustomText(
                    maxMinSales,
                    FormatPrice.translate("minSales")
                ),
                items,
                maxMinConsumption,
                maxMinSales,
                seatingTotal: calculatedSeating.total
            };
        }
    }

    // Multipass operation or no min spendings 
    // -> just return collected prices
    return {
        total: totalOtherWithSeating,
        totalFormatted: FormatPrice.formatPriceWithType({
            price: totalOtherWithSeating,
            //pricingLabel: pricingLabel as PricingLabels,
            context: props.context,
            short: props.short === true,
            noneLabelKey: "free"
        }),
        items,
        maxMinConsumption,
        maxMinSales,
        seatingTotal: calculatedSeating.total
    };
};

const createDefaultSlot = (
    basePrice: number,
    basePriceType: string,
    basePriceLabel?: string,
): PricingSlot => {
    return {
        id: 0,
        roomPricingType: "basic",
        startDayOfWeek: 0,
        endDayOfWeek: 6,
        startTime: "00:00:00",
        endTime: "23:59:59",
        price: basePrice,
        priceType: basePriceType,
        pricingLabel: basePriceLabel ?? PricingLabel.exact,
        exclusiveType: "optional",
        exclusivePriceType: null,
        exclusivePrice: null,
    };
};

const calculateDefaultSlot = ({
    bookingStart,
    bookingEnd,
    persons,
    basePrice,
    basePriceType,
    basePriceLabel,
    excludeRoomPrice,
    excludeExclusive,
    seating,
    seatings,
    context,
    short,
    isSingleOperation,
}: BookingPriceProps
) => {
    // Create and use a default schedule for room base pricing
    // when no ranges / schedules are found
    const defaultSchedule: PricingSlot = createDefaultSlot(
        basePrice,
        basePriceType,
        basePriceLabel
    );

    return calculateSlots(
        [{
            schedule: defaultSchedule,
            segmentStart: bookingStart,
            segmentEnd: bookingEnd
        }],
        {
            bookingStart,
            bookingEnd,
            persons,
            excludeRoomPrice,
            excludeExclusive,
            seating,
            seatings,
            context,
            short,
            isSingleOperation,
        }
    );
};

export const calculateBookingPrice = ({
    bookingStart,
    bookingEnd,
    persons,
    basePrice,
    basePriceType,
    basePriceLabel,
    excludeRoomPrice,
    excludeExclusive,
    seating,
    schedules,
    seatings,
    context,
    short,
    isSingleOperation,
}: BookingPriceProps): {
    total: number,
    totalFormatted: string,
    maxMinConsumption: number,
    maxMinSales: number,
    items: PriceItem[],
    appliedSlots: PricingSlot[]
} => {
    let totalPrice = 0;
    const items: PriceItem[] = [];
    const appliedSlots: PricingSlot[] = [];

    const basicRanges: { start: Date; end: Date }[] = [];
    const extraRanges: { start: Date; end: Date; price: number }[] = [];

    let maxMinConsumption = 0;
    let maxMinSales = 0;

    const applicableSlots = getApplicableSlots(bookingStart, bookingEnd, schedules);

    let totalFormatted: string | null | undefined = undefined;

    //console.log("applicableSlots", basePrice, applicableSlots);

    const slotsResult = calculateSlots(
        applicableSlots,
        {
            bookingStart,
            bookingEnd,
            persons,
            excludeRoomPrice,
            excludeExclusive,
            seating,
            seatings,
            context,
            short,
            isSingleOperation,
        }
    );

    applicableSlots.forEach(slot => {
        if (slot.schedule.roomPricingType === "basic") {
            basicRanges.push({ start: slot.segmentStart, end: slot.segmentEnd });
        }
    });

    totalPrice += slotsResult.total;
    items.push(...slotsResult.items);
    totalFormatted = slotsResult.totalFormatted;
    maxMinConsumption = Math.max(maxMinConsumption, slotsResult.maxMinConsumption);
    maxMinSales = Math.max(maxMinSales, slotsResult.maxMinSales);

    // No ranges from schedules -> return base prices
    if (basicRanges.length === 0 && extraRanges.length === 0) {
        if (excludeRoomPrice === true) return {
            total: 0,
            totalFormatted: FormatPrice.formatPriceValue(0),
            maxMinConsumption,
            maxMinSales,
            items,
            appliedSlots
        };

        const baseResult = calculateDefaultSlot({
            bookingStart,
            bookingEnd,
            persons,
            basePrice,
            basePriceType,
            basePriceLabel,
            excludeRoomPrice,
            excludeExclusive,
            seating,
            seatings,
            context,
            short,
            isSingleOperation
        });

        maxMinConsumption = Math.max(maxMinConsumption, baseResult.maxMinConsumption);
        maxMinSales = Math.max(maxMinSales, baseResult.maxMinSales);

        return {
            total: baseResult.total,
            totalFormatted: baseResult.totalFormatted,
            maxMinConsumption,
            maxMinSales,
            items: baseResult.items,
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

    if (excludeRoomPrice !== true) {
        let unaccountedStart = bookingStart;

        const uncoveredSlots = [];

        // Uncovered time periods before and between ranges
        for (const range of mergedBasicRanges) {
            if (isBefore(unaccountedStart, range.start)) {
                console.log("UNCOVERED RANGES BEFORE!!!");

                uncoveredSlots.push({
                    schedule: createDefaultSlot(basePrice, basePriceType, basePriceLabel),
                    segmentStart: unaccountedStart,
                    segmentEnd: range.start,
                });
            }

            unaccountedStart = new Date(Math.max(unaccountedStart.getTime(), range.end.getTime()));
        }

        // Remaining time period, not covered by ranges
        if (isBefore(unaccountedStart, bookingEnd)) {
            console.log("UNCOVERED RANGES AFTER!!!");

            uncoveredSlots.push({
                schedule: createDefaultSlot(basePrice, basePriceType, basePriceLabel),
                segmentStart: unaccountedStart,
                segmentEnd: bookingEnd,
            });
        }

        if (uncoveredSlots.length > 0) {
            const uncoveredResult = calculateSlots(
                uncoveredSlots,
                {
                    bookingStart,
                    bookingEnd,
                    persons,
                    excludeRoomPrice,
                    excludeExclusive,
                    seating,
                    seatings,
                    context,
                    short,
                    isSingleOperation,
                }
            );

            totalPrice += uncoveredResult.total;
            items.push(...uncoveredResult.items);
            totalFormatted = uncoveredResult.totalFormatted;
            maxMinConsumption = Math.max(maxMinConsumption, uncoveredResult.maxMinConsumption);
            maxMinSales = Math.max(maxMinSales, uncoveredResult.maxMinSales);
        }
    }

    return {
        total: totalPrice,
        totalFormatted: totalFormatted ?? FormatPrice.formatPriceValue(totalPrice),
        maxMinConsumption,
        maxMinSales,
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
        const seatingBasePrice = seatingToApply.isAbsolute
            ? seatingToApply.price
            : totalPrice * (seatingToApply.price / 100);

        const seatingPrice = calculatePriceByPriceType(
            seatingBasePrice,
            seatingToApply.priceType,
            bookingStart,
            bookingEnd,
            persons,
        );

        const seatingName = `Seating (${FormatPrice.translate("seating_" + seatingToApply.seating)})`;

        if (seatingToApply.reconfigPriceType != "none" &&
            seatingToApply.reconfigPrice &&
            seatingToApply.reconfigPriceType
        ) {
            const reconfigBasePrice = seatingToApply.reconfigIsAbsolute
                ? seatingToApply.reconfigPrice
                : totalPrice * (seatingToApply.reconfigPrice / 100); // or seatingPrice * (seatingToApply.reconfigPrice / 100)

            const reconfigPrice = calculatePriceByPriceType(
                reconfigBasePrice,
                seatingToApply.reconfigPriceType,
                bookingStart,
                bookingEnd,
                persons,
            );

            const seatingTotal = seatingPrice + reconfigPrice;

            return {
                total: seatingTotal,
                items: [{
                    id: seatingToApply.id,
                    name: seatingName,
                    itemType: "seating",
                    price: seatingTotal,
                    quantity: 1,
                    unitPrice: seatingPrice,
                    priceFormatted: FormatPrice.formatPriceWithType({
                        price: seatingTotal,
                        noneLabelKey: "free",
                    }),
                    unitPriceFormatted: FormatPrice.formatPriceWithType({
                        price: seatingTotal,
                        noneLabelKey: "free",
                    }),
                }]
            };

        }

        return {
            total: seatingPrice,
            items: [{
                id: seatingToApply.id,
                name: seatingName,
                itemType: "seating",
                price: seatingPrice,
                pricingLabel: seatingToApply.pricingLabel,
                quantity: 1,
                unitPrice: seatingPrice,
                priceFormatted: FormatPrice.formatPriceWithType({
                    price: seatingPrice,
                    noneLabelKey: "free",
                }),
                unitPriceFormatted: FormatPrice.formatPriceWithType({
                    price: seatingPrice,
                    noneLabelKey: "free",
                }),
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
        "onConsumption": "nach Verbrauch",
        "pricing_basic": "Grundpreis",
        "pricing_extra": "Aufpreis",
        "seating_empty": "ohne Mobiliar",
        "seating_mixed": "Gemischt",
        "seating_standing": "Stehplätze",
        "seating_seated": "Sitzplätze",
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
        "onConsumption": "nach Verbrauch",
        "pricing_basic": "Grundpreis",
        "pricing_extra": "Aufpreis",
        "seating_empty": "ohne Mobiliar",
        "seating_mixed": "Gemischt",
        "seating_standing": "Stehplätze",
        "seating_seated": "Sitzplätze",
    } as const;

    static formatPriceValue(price: number): string {
        return new Intl.NumberFormat('de-DE', {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
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
        trailing: boolean = false
    ): string {
        const strPrice = FormatPrice.formatPriceValue(price);

        if (text.length === 0) {
            return strPrice;
        }

        return trailing
            ? `${strPrice} ${text}`
            : `${text} ${strPrice}`;
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

    static translate(key: string, short?: boolean): string {
        if (short) {
            return FormatPrice
                .staticShortTranslations[key as keyof typeof FormatPrice.staticShortTranslations]
                ?? key;
        }
        return FormatPrice
            .staticTranslations[key as keyof typeof FormatPrice.staticTranslations]
            ?? key;
    }
}
