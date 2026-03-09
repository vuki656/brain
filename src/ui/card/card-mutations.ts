import type { CardType, ProjectType, SubtaskType } from "../../shared"

type SpliceCardOptionsType = {
    cardIndex: number
    deleteCount: number
    insertCards?: CardType[]
    projectIndex: number
    projects: ProjectType[]
}

type UpdateCardOptionsType = {
    cardIndex: number
    projectIndex: number
    projects: ProjectType[]
    update: Partial<CardType>
}

export function immutableSpliceCard(options: SpliceCardOptionsType): ProjectType[] {
    const { cardIndex, deleteCount, insertCards = [], projectIndex, projects } = options

    return projects.map((project, index) => {
        if (index !== projectIndex) {
            return project
        }

        const newCards = [...project.cards]
        newCards.splice(cardIndex, deleteCount, ...insertCards)

        return { ...project, cards: newCards }
    })
}

export function immutableToggleSubtask(subtasks: SubtaskType[], subtaskId: string): SubtaskType[] {
    return subtasks.map((subtask) => {
        if (subtask.id !== subtaskId) {
            return subtask
        }

        return { ...subtask, completed: !subtask.completed }
    })
}

export function immutableAddSubtask(
    subtasks: SubtaskType[],
    newSubtask: SubtaskType,
): SubtaskType[] {
    return [...subtasks, newSubtask]
}

export function immutableDeleteSubtask(subtasks: SubtaskType[], subtaskId: string): SubtaskType[] {
    return subtasks.filter((subtask) => {
        return subtask.id !== subtaskId
    })
}

export function immutableUpdateCard(options: UpdateCardOptionsType): ProjectType[] {
    const { cardIndex, projectIndex, projects, update } = options

    return projects.map((project, projIndex) => {
        if (projIndex !== projectIndex) {
            return project
        }

        return {
            ...project,
            cards: project.cards.map((card, cIndex) => {
                if (cIndex !== cardIndex) {
                    return card
                }

                return { ...card, ...update }
            }),
        }
    })
}
