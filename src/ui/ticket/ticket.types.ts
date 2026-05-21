export type TicketStatusType = "done" | "in-progress" | "mine" | "waiting" | null

export type TicketEntryType = {
    text: string
    timestamp: string
}

export type TicketType = {
    entries: TicketEntryType[]
    hidden: boolean
    lastUpdated: string | null
    link: string | null
    name: string
    projectTitle: string
    status: TicketStatusType
}
