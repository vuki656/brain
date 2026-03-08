import { differenceInCalendarDays, format, startOfDay } from "date-fns"

export function toDateString(date: Date): string {
    return format(date, "yyyy-MM-dd")
}

export function getDayDifference(dateString: string): number {
    const cardDate = startOfDay(new Date(`${dateString}T00:00:00`))
    const today = startOfDay(new Date())

    return differenceInCalendarDays(cardDate, today)
}

export function formatDate(dateString: string): string {
    const dayDifference = getDayDifference(dateString)

    if (dayDifference === 0) {
        return "Today"
    }

    if (dayDifference === 1) {
        return "Tomorrow"
    }

    if (dayDifference === -1) {
        return "Yesterday"
    }

    if (dayDifference < -1) {
        return `${Math.abs(dayDifference)} days ago`
    }

    if (dayDifference <= 7) {
        return `In ${dayDifference} days`
    }

    return dateString
}
