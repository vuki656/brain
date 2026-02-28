import type { BoardType, CardType } from "../../shared"
import { toDateString } from "../../shared"
import type { DateGroupType, TodayCardType } from "./today-view.types"

function isCardVisibleInTodayFilter(card: CardType): boolean {
    if (card.completed) {
        return false
    }

    if (card.date) {
        return true
    }

    return false
}

function sortCardsByOrder(cards: TodayCardType[], savedOrder: string[]): TodayCardType[] {
    if (savedOrder.length === 0) {
        return cards
    }

    const sorted = [...cards]

    sorted.sort((first, second) => {
        const indexOfFirst = savedOrder.indexOf(first.card.id)
        const indexOfSecond = savedOrder.indexOf(second.card.id)
        const effectiveFirst = indexOfFirst === -1 ? savedOrder.length : indexOfFirst
        const effectiveSecond = indexOfSecond === -1 ? savedOrder.length : indexOfSecond

        return effectiveFirst - effectiveSecond
    })

    return sorted
}

function formatDateGroupLabel(dateString: string): string {
    const cardDate = new Date(`${dateString}T00:00:00`)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    cardDate.setHours(0, 0, 0, 0)

    const differenceInDays = Math.round(
        (cardDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (differenceInDays === 1) {
        return "Tomorrow"
    }

    if (differenceInDays <= 7) {
        return `In ${differenceInDays} days`
    }

    return cardDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        weekday: "short",
    })
}

function formatDateGroupSubtitle(dateKey: string): string {
    if (dateKey === "today" || dateKey === "overdue") {
        return ""
    }

    const date = new Date(`${dateKey}T00:00:00`)
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    const differenceInDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (differenceInDays < 1 || differenceInDays > 7) {
        return ""
    }

    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" })
}

function addCardToFutureBucket(
    futureBuckets: Map<string, TodayCardType[]>,
    dateKey: string,
    todayCard: TodayCardType,
): void {
    const existing = futureBuckets.get(dateKey)

    if (existing) {
        existing.push(todayCard)
    } else {
        futureBuckets.set(dateKey, [todayCard])
    }
}

function collectCardsByDateGroup(board: BoardType): DateGroupType[] {
    const todayString = toDateString(new Date())
    const overdueCards: TodayCardType[] = []
    const todayCards: TodayCardType[] = []
    const futureBuckets = new Map<string, TodayCardType[]>()

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex]

        for (let cardIndex = 0; cardIndex < column.cards.length; cardIndex++) {
            const card = column.cards[cardIndex]

            if (!isCardVisibleInTodayFilter(card)) {
                continue
            }

            if (!card.date) {
                continue
            }

            const todayCard: TodayCardType = {
                card,
                cardIndex,
                columnIndex,
                columnTitle: column.title,
            }

            if (card.date.localeCompare(todayString) < 0) {
                overdueCards.push(todayCard)

                continue
            }

            if (card.date === todayString) {
                todayCards.push(todayCard)

                continue
            }

            addCardToFutureBucket(futureBuckets, card.date, todayCard)
        }
    }

    const savedOrder = board.settings.todayOrder
    const groups: DateGroupType[] = []

    if (overdueCards.length > 0) {
        groups.push({
            cards: sortCardsByOrder(overdueCards, savedOrder.overdue ?? []),
            dateKey: "overdue",
            label: "Overdue",
        })
    }

    groups.push({
        cards: sortCardsByOrder(todayCards, savedOrder.today ?? []),
        dateKey: "today",
        label: "Today",
    })

    const sortedFutureDates = [...futureBuckets.keys()].sort((first, second) => {
        return first.localeCompare(second)
    })

    for (const dateKey of sortedFutureDates) {
        const cards = futureBuckets.get(dateKey)

        if (!cards) {
            continue
        }

        groups.push({
            cards: sortCardsByOrder(cards, savedOrder[dateKey] ?? []),
            dateKey,
            label: formatDateGroupLabel(dateKey),
        })
    }

    return groups
}

function getDateForSection(dateKey: string): string | null {
    if (dateKey === "today") {
        return toDateString(new Date())
    }

    if (dateKey === "overdue") {
        return null
    }

    return dateKey
}

function collectTodayOrderFromSections(
    sectionCardLists: { dateKey: string; element: HTMLElement }[],
): Record<string, string[]> {
    const newTodayOrder: Record<string, string[]> = {}

    for (const listItem of sectionCardLists) {
        const cardElements = listItem.element.querySelectorAll<HTMLElement>(".kanban-card")
        const orderIds: string[] = []

        for (const element of Array.from(cardElements)) {
            const elementCardId = element.dataset.cardId

            if (elementCardId) {
                orderIds.push(elementCardId)
            }
        }

        if (orderIds.length > 0) {
            newTodayOrder[listItem.dateKey] = orderIds
        }
    }

    return newTodayOrder
}

export {
    collectCardsByDateGroup,
    collectTodayOrderFromSections,
    formatDateGroupLabel,
    formatDateGroupSubtitle,
    getDateForSection,
    isCardVisibleInTodayFilter,
    sortCardsByOrder,
}
