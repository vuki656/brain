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
