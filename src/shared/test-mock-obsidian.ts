/* eslint-disable max-classes-per-file, @typescript-eslint/no-floating-promises, @typescript-eslint/no-extraneous-class, @typescript-eslint/no-empty-function, @typescript-eslint/require-await -- Fine for mock here */

import { mock } from "bun:test"

mock.module("obsidian", () => {
    return {
        App: class {},
        Menu: class {},
        Notice: class {},
        TFile: class {},
        Vault: class {},
        requestUrl: async () => {
            return { text: "" }
        },
        setIcon: () => {},
    }
})
