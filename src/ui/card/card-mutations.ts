import type { CardType, ColumnType } from "../../core/shared/types"

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
