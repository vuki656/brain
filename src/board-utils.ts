import type { CardType, ColumnType } from "./types"

type SpliceCardOptionsType = {
    cardIndex: number
    columnIndex: number
    columns: ColumnType[]
    deleteCount: number
    insertCards?: CardType[]
}

type UpdateCardOptionsType = {
    cardIndex: number
    columnIndex: number
    columns: ColumnType[]
    update: Partial<CardType>
}

export function immutableSpliceCard(options: SpliceCardOptionsType): ColumnType[] {
    const { cardIndex, columnIndex, columns, deleteCount, insertCards = [] } = options

    return columns.map((column, index) => {
        if (index !== columnIndex) {
            return column
        }

        const newCards = [...column.cards]
        newCards.splice(cardIndex, deleteCount, ...insertCards)

        return { ...column, cards: newCards }
    })
}

export function immutableUpdateCard(options: UpdateCardOptionsType): ColumnType[] {
    const { cardIndex, columnIndex, columns, update } = options

    return columns.map((column, colIndex) => {
        if (colIndex !== columnIndex) {
            return column
        }

        return {
            ...column,
            cards: column.cards.map((card, cIndex) => {
                if (cIndex !== cardIndex) {
                    return card
                }

                return { ...card, ...update }
            }),
        }
    })
}

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
