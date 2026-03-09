import { core, customDefineConfig, typescript, packageJson } from "@dvukovic/style-guide/eslint"

export default [
    ...customDefineConfig({
        configs: [
            core({
                rules: {
                    "no-new": "off",
                    "sonarjs/constructor-for-side-effects": "off",
                    "sonarjs/no-implicit-dependencies": "off",
                },
            }),
            typescript({
                languageOptions: {
                    parserOptions: {
                        project: "./tsconfig.eslint.json",
                    },
                },
            }),
            packageJson(),
        ],
    }),
    {
        files: ["**/*.test.ts"],
        rules: {
            "sonarjs/max-lines": "off",
        },
    },
]
