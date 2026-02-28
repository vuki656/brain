import type { KnipConfig } from "knip"

import { core } from "@dvukovic/style-guide/knip"

const config: KnipConfig = {
    ...core,
    ignore: [],
    ignoreDependencies: core.ignoreDependencies.filter((dep: string) => {
        return dep !== "prettier-plugin-*"
    }),
}

export default config
