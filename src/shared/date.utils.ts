export function toDateString(date: Date): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`
}

export function getNextMonday(): Date {
    const date = new Date()
    const daysUntilMonday = (8 - date.getDay()) % 7 || 7

    date.setDate(date.getDate() + daysUntilMonday)

    return date
}

export function formatDate(dateString: string): string {
    const cardDate = new Date(dateString)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    cardDate.setHours(0, 0, 0, 0)

    const differenceInDays = Math.round(
        (cardDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (differenceInDays === 0) {
        return "Today"
    }

    if (differenceInDays === 1) {
        return "Tomorrow"
    }

    if (differenceInDays === -1) {
        return "Yesterday"
    }

    if (differenceInDays < -1) {
        return `${Math.abs(differenceInDays)} days ago`
    }

    if (differenceInDays <= 7) {
        return `In ${differenceInDays} days`
    }

    return dateString
}
