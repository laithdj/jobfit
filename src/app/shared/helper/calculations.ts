export function nextNearest(value:number, number:number) {
    var remainder = value % number;
    if (remainder >= (number / 2))
        value = value - remainder + number;
    else value = value - remainder;
    return value;
}

export function addDates(date: Date, offset: number, dateType: string) {
    switch(dateType) {
        case "years":
            return date.setFullYear(date.getFullYear() + offset);
        case "months":
            return date.setMonth(date.getMonth() + offset);
        case "days":
            return date.setDate(date.getDate() + offset);
        default:
            return date;
    }
}