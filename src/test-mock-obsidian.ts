import { mock } from "bun:test";

mock.module("obsidian", () => ({
    App: class {},
    Menu: class {},
    Notice: class {},
    TFile: class {},
    Vault: class {},
    requestUrl: () => Promise.resolve({ text: "" }),
    setIcon: () => {},
}));
