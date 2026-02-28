import { core } from "@dvukovic/style-guide/cspell"

/** @type {import("cspell").FileSettings} */
const config = {
    ...core,
    ignorePaths: [...core.ignorePaths],
    ignoreWords: ["frontmatter", "hasdate", "lezer", "nodate", "reparsed", "vuki"],
}

export default config
