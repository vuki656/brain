/* eslint-disable max-classes-per-file, @typescript-eslint/no-extraneous-class, @typescript-eslint/no-empty-function, @typescript-eslint/require-await -- Fine for mock here */

import { mock } from "bun:test"

mock.module("obsidian", () => {
    return {
        App: class {},
        getIconIds: () => {
            return []
        },
        Menu: class {},
        Notice: class {},
        requestUrl: async () => {
            return { text: "" }
        },
        setIcon: () => {},
        TFile: class {},
        Vault: class {},
    }
})
