import { core, customDefineConfig, typescript } from "@dvukovic/style-guide/eslint"

export default [
    ...customDefineConfig({
        configs: [
            core({
                rules: {
                    "max-lines": "off",
                    "no-new": "off",
                    "sonarjs/constructor-for-side-effects": "off",
                    "sonarjs/max-lines": "off",
                    "sonarjs/no-implicit-dependencies": "off",
                },
            }),
            typescript({
                languageOptions: {
                    parserOptions: {
                        project: "./tsconfig.eslint.json",
                    },
                },
                rules: {
                    "@typescript-eslint/consistent-type-assertions": "off",
                },
            }),
        ],
        ignores: ["main.js"],
    }),
    {
        files: ["**/*.test.ts", "**/test-*.ts"],
        rules: {
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-extraneous-class": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/require-await": "off",
            "max-classes-per-file": "off",
        },
    },
]
