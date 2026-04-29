type TicketProviderType = {
    name: string
    pattern: RegExp
}

const TICKET_PROVIDERS: TicketProviderType[] = [
    {
        name: "Linear",
        pattern: /linear\.app\/[^/]+\/issue\/([a-z]+-\d+)/i,
    },
]

type TicketIdMatchType = {
    id: string
    source: string
}

function extractTicketId(link: string | null | undefined): TicketIdMatchType | null {
    if (!link) {
        return null
    }

    for (const provider of TICKET_PROVIDERS) {
        const match = provider.pattern.exec(link)

        if (match?.[1]) {
            return { id: match[1].toUpperCase(), source: provider.name }
        }
    }

    return null
}

export type { TicketIdMatchType, TicketProviderType }
export { extractTicketId, TICKET_PROVIDERS }
