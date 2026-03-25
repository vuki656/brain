import type { RawConfiguration } from "knip/dist/types/config"

import { core } from "@dvukovic/style-guide/knip"

const config: RawConfiguration = {
    ...core,
    ignore: [],
    ignoreDependencies: core.ignoreDependencies.filter((dep: string) => {
        return dep !== "prettier-plugin-*" && dep !== "stylelint-no-unused-selectors"
    }),
}

export default config
