export type TicketStatusType = "mine" | "waiting" | null

export type TicketEntryType = {
    text: string
    timestamp: string
}

export type TicketType = {
    entries: TicketEntryType[]
    lastUpdated: string | null
    link: string | null
    name: string
    projectTitle: string
    status: TicketStatusType
}
