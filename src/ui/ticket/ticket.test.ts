import { describe, expect, it } from "bun:test"

import { parseTicketFile, serializeTicketFile } from "./ticket"

describe("parseTicketFile", () => {
    it("should parse frontmatter link and dated entries", () => {
        const content = `---
link: https://example.com/issues/XYZ-1
---

- 2026-04-29 14:32 — first reported issue
- 2026-04-27 10:15 — pushed fix, awaiting review
`
        const parsed = parseTicketFile(content)

        expect(parsed.link).toBe("https://example.com/issues/XYZ-1")
        expect(parsed.entries).toHaveLength(2)
        expect(parsed.entries[0].timestamp).toBe("2026-04-29 14:32")
        expect(parsed.entries[0].text).toBe("first reported issue")
        expect(parsed.entries[1].timestamp).toBe("2026-04-27 10:15")
    })

    it("should return null link when missing", () => {
        const content = `---
---

- 2026-04-29 14:32 — single entry
`
        const parsed = parseTicketFile(content)

        expect(parsed.link).toBeNull()
        expect(parsed.entries).toHaveLength(1)
    })

    it("should return empty entries when none present", () => {
        const content = `---
link: https://example.com
---

`
        const parsed = parseTicketFile(content)

        expect(parsed.entries).toEqual([])
    })

    it("should accept date-only timestamps", () => {
        const content = `---
link:
---

- 2026-04-29 — single entry without time
`
        const parsed = parseTicketFile(content)

        expect(parsed.entries[0].timestamp).toBe("2026-04-29")
        expect(parsed.entries[0].text).toBe("single entry without time")
    })
})

describe("serializeTicketFile", () => {
    it("should serialize link and entries with newest first", () => {
        const serialized = serializeTicketFile("https://example.com/X", [
            { text: "newest", timestamp: "2026-04-29 14:32" },
            { text: "older", timestamp: "2026-04-27 10:15" },
        ])

        expect(serialized).toBe(
            "---\nlink: https://example.com/X\n---\n\n- 2026-04-29 14:32 — newest\n- 2026-04-27 10:15 — older",
        )
    })

    it("should serialize empty link as empty string", () => {
        const serialized = serializeTicketFile(null, [])

        expect(serialized).toBe("---\nlink: \n---\n")
    })

    it("should round-trip through parse and serialize", () => {
        const original = `---
link: https://example.com/issues/XYZ-2
---

- 2026-04-29 14:32 — first entry
- 2026-04-27 10:15 — second entry
`
        const parsed = parseTicketFile(original)
        const serialized = serializeTicketFile(parsed.link, parsed.entries, parsed.status)
        const reparsed = parseTicketFile(serialized)

        expect(reparsed.link).toBe(parsed.link)
        expect(reparsed.entries).toEqual(parsed.entries)
    })
})

describe("ticket status", () => {
    it("should parse status field from frontmatter", () => {
        const content = `---
link: https://example.com
status: mine
---

- 2026-04-29 — first entry
`
        const parsed = parseTicketFile(content)

        expect(parsed.status).toBe("mine")
    })

    it("should return null for missing status", () => {
        const content = `---
link: https://example.com
---

- 2026-04-29 — first entry
`
        const parsed = parseTicketFile(content)

        expect(parsed.status).toBeNull()
    })

    it("should return null for invalid status value", () => {
        const content = `---
link:
status: garbage
---

`
        const parsed = parseTicketFile(content)

        expect(parsed.status).toBeNull()
    })

    it("should serialize status into frontmatter when set", () => {
        const serialized = serializeTicketFile("https://example.com", [], "waiting")

        expect(serialized).toContain("status: waiting")
    })

    it("should omit status line when null", () => {
        const serialized = serializeTicketFile("https://example.com", [], null)

        expect(serialized).not.toContain("status:")
    })

    it("should round-trip status through parse and serialize", () => {
        const original = `---
link: https://example.com
status: mine
---

- 2026-04-29 — first entry
`
        const parsed = parseTicketFile(original)
        const serialized = serializeTicketFile(parsed.link, parsed.entries, parsed.status)
        const reparsed = parseTicketFile(serialized)

        expect(reparsed.status).toBe("mine")
    })
})
