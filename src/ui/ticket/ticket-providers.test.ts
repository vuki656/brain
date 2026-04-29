import { describe, expect, it } from "bun:test"

import { extractTicketId } from "./ticket-providers"

describe("extractTicketId", () => {
    it("should extract id from a Linear issue url", () => {
        const result = extractTicketId(
            "https://linear.app/example-org/issue/ABC-123/some-feature-slug",
        )

        expect(result).toEqual({ id: "ABC-123", source: "Linear" })
    })

    it("should uppercase the extracted id", () => {
        const result = extractTicketId("https://linear.app/example-org/issue/abc-456/slug")

        expect(result).toEqual({ id: "ABC-456", source: "Linear" })
    })

    it("should return null for unmatched urls", () => {
        expect(extractTicketId("https://example.com/something")).toBeNull()
        expect(extractTicketId("not a url")).toBeNull()
    })

    it("should return null for empty input", () => {
        expect(extractTicketId(null)).toBeNull()
        expect(extractTicketId("")).toBeNull()
    })
})
