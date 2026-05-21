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
        const serialized = serializeTicketFile({
            entries: [
                { text: "newest", timestamp: "2026-04-29 14:32" },
                { text: "older", timestamp: "2026-04-27 10:15" },
            ],
            link: "https://example.com/X",
        })

        expect(serialized).toBe(
            "---\nlink: https://example.com/X\n---\n\n- 2026-04-29 14:32 — newest\n- 2026-04-27 10:15 — older",
        )
    })

    it("should serialize empty link as empty string", () => {
        const serialized = serializeTicketFile({ entries: [], link: null })

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
        const serialized = serializeTicketFile({
            entries: parsed.entries,
            link: parsed.link,
            status: parsed.status,
        })
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
        const serialized = serializeTicketFile({
            entries: [],
            link: "https://example.com",
            status: "waiting",
        })

        expect(serialized).toContain("status: waiting")
    })

    it("should omit status line when null", () => {
        const serialized = serializeTicketFile({
            entries: [],
            link: "https://example.com",
            status: null,
        })

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
        const serialized = serializeTicketFile({
            entries: parsed.entries,
            link: parsed.link,
            status: parsed.status,
        })
        const reparsed = parseTicketFile(serialized)

        expect(reparsed.status).toBe("mine")
    })

    it("should parse done status from frontmatter", () => {
        const content = `---
link: https://example.com/issues/QRS-9
status: done
---

- 2026-05-02 — shipped to production
`
        const parsed = parseTicketFile(content)

        expect(parsed.status).toBe("done")
    })

    it("should parse in-progress status from frontmatter", () => {
        const content = `---
link: https://example.com/issues/JKL-7
status: in-progress
---

- 2026-05-10 — picked up
`
        const parsed = parseTicketFile(content)

        expect(parsed.status).toBe("in-progress")
    })

    it("should round-trip in-progress status through parse and serialize", () => {
        const original = `---
link:
status: in-progress
---

- 2026-05-10 — picked up
`
        const parsed = parseTicketFile(original)
        const serialized = serializeTicketFile({
            entries: parsed.entries,
            link: parsed.link,
            status: parsed.status,
        })
        const reparsed = parseTicketFile(serialized)

        expect(reparsed.status).toBe("in-progress")
    })

    it("should round-trip done status through parse and serialize", () => {
        const original = `---
link:
status: done
---

- 2026-05-02 — closed out
`
        const parsed = parseTicketFile(original)
        const serialized = serializeTicketFile({
            entries: parsed.entries,
            link: parsed.link,
            status: parsed.status,
        })
        const reparsed = parseTicketFile(serialized)

        expect(reparsed.status).toBe("done")
    })
})

describe("ticket hidden", () => {
    it("should parse hidden flag from frontmatter", () => {
        const content = `---
link: https://example.com
hidden: true
---

- 2026-04-29 — entry
`
        const parsed = parseTicketFile(content)

        expect(parsed.hidden).toBe(true)
    })

    it("should default hidden to false when missing", () => {
        const content = `---
link: https://example.com
---

- 2026-04-29 — entry
`
        const parsed = parseTicketFile(content)

        expect(parsed.hidden).toBe(false)
    })

    it("should serialize hidden flag when true", () => {
        const serialized = serializeTicketFile({
            entries: [],
            hidden: true,
            link: "https://example.com",
        })

        expect(serialized).toContain("hidden: true")
    })

    it("should omit hidden line when false", () => {
        const serialized = serializeTicketFile({
            entries: [],
            hidden: false,
            link: "https://example.com",
        })

        expect(serialized).not.toContain("hidden:")
    })

    it("should round-trip hidden flag with status through parse and serialize", () => {
        const original = `---
link: https://example.com/issues/HID-1
status: done
hidden: true
---

- 2026-05-02 — wrapped up
`
        const parsed = parseTicketFile(original)
        const serialized = serializeTicketFile({
            entries: parsed.entries,
            hidden: parsed.hidden,
            link: parsed.link,
            status: parsed.status,
        })
        const reparsed = parseTicketFile(serialized)

        expect(reparsed.hidden).toBe(true)
        expect(reparsed.status).toBe("done")
    })
})
