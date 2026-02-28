import { core } from "@dvukovic/style-guide/stylelint"

/** @type {import("stylelint").Config} */
const config = {
    ...core,
    rules: {
        ...core.rules,
        "no-descending-specificity": null,
    },
}

export default config
