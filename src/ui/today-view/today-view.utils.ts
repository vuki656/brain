import type { BoardType, CardType } from "../../shared"
import { getDayDifference, toDateString } from "../../shared"
import type { CollectedDateGroupsType, DateGroupType, TodayCardType } from "./today-view.types"

function isCardVisibleInTodayFilter(card: CardType): boolean {
    if (card.completed) {
        return false
    }

    if (card.date) {
        return true
    }

    if (card.backlog) {
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
    const dayDifference = getDayDifference(dateString)

    if (dayDifference === 1) {
        return "Tomorrow"
    }

    if (dayDifference <= 7) {
        return `In ${dayDifference} days`
    }

    const cardDate = new Date(`${dateString}T00:00:00`)

    return cardDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        weekday: "short",
    })
}

function formatDateGroupSubtitle(dateKey: string): string {
    if (dateKey === "today" || dateKey === "overdue" || dateKey === "backlog") {
        return ""
    }

    const dayDifference = getDayDifference(dateKey)

    if (dayDifference < 1 || dayDifference > 7) {
        return ""
    }

    const date = new Date(`${dateKey}T00:00:00`)

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

function extractCardIds(cards: TodayCardType[]): string[] {
    return cards.map((todayCard) => {
        return todayCard.card.id
    })
}

function collectCardsByDateGroup(board: BoardType): CollectedDateGroupsType {
    const todayString = toDateString(new Date())
    const overdueCards: TodayCardType[] = []
    const todayCards: TodayCardType[] = []
    const backlogCards: TodayCardType[] = []
    const futureBuckets = new Map<string, TodayCardType[]>()

    for (let projectIndex = 0; projectIndex < board.projects.length; projectIndex++) {
        const project = board.projects[projectIndex]

        if (!project) {
            continue
        }

        if (board.settings.archivedProjects.includes(project.title)) {
            continue
        }

        for (let cardIndex = 0; cardIndex < project.cards.length; cardIndex++) {
            const card = project.cards[cardIndex]

            if (!card) {
                continue
            }

            if (!isCardVisibleInTodayFilter(card)) {
                continue
            }

            const todayCard: TodayCardType = {
                card,
                cardIndex,
                projectIndex,
                projectTitle: project.title,
            }

            if (card.backlog) {
                backlogCards.push(todayCard)

                continue
            }

            if (!card.date) {
                continue
            }

            const todayCardWithDate: TodayCardType = {
                card,
                cardIndex,
                projectIndex,
                projectTitle: project.title,
            }

            if (card.date.localeCompare(todayString) < 0) {
                overdueCards.push(todayCardWithDate)

                continue
            }

            if (card.date === todayString) {
                todayCards.push(todayCardWithDate)

                continue
            }

            addCardToFutureBucket(futureBuckets, card.date, todayCardWithDate)
        }
    }

    const savedOrder = board.settings.todayOrder
    const groups: DateGroupType[] = []
    const cleanedTodayOrder: Record<string, string[]> = {}

    if (overdueCards.length > 0) {
        const sorted = sortCardsByOrder(overdueCards, savedOrder.overdue ?? [])

        groups.push({ cards: sorted, dateKey: "overdue", label: "Overdue" })
        cleanedTodayOrder.overdue = extractCardIds(sorted)
    }

    const sortedTodayCards = sortCardsByOrder(
        todayCards,
        savedOrder[todayString] ?? savedOrder.today ?? [],
    )

    groups.push({ cards: sortedTodayCards, dateKey: "today", label: "Today" })

    if (sortedTodayCards.length > 0) {
        cleanedTodayOrder.today = extractCardIds(sortedTodayCards)
    }

    const sortedFutureDates = [...futureBuckets.keys()].sort((first, second) => {
        return first.localeCompare(second)
    })

    for (const dateKey of sortedFutureDates) {
        const cards = futureBuckets.get(dateKey)

        if (!cards) {
            continue
        }

        const sorted = sortCardsByOrder(cards, savedOrder[dateKey] ?? [])

        groups.push({ cards: sorted, dateKey, label: formatDateGroupLabel(dateKey) })
        cleanedTodayOrder[dateKey] = extractCardIds(sorted)
    }

    const sortedBacklogCards = sortCardsByOrder(backlogCards, savedOrder.backlog ?? [])

    groups.push({ cards: sortedBacklogCards, dateKey: "backlog", label: "Backlog" })

    if (sortedBacklogCards.length > 0) {
        cleanedTodayOrder.backlog = extractCardIds(sortedBacklogCards)
    }

    return { cleanedTodayOrder, groups }
}

function getDateForSection(dateKey: string): string | null {
    if (dateKey === "today") {
        return toDateString(new Date())
    }

    if (dateKey === "overdue" || dateKey === "backlog") {
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
