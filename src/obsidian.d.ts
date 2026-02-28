import type { App, PluginManifest } from "obsidian"

declare module "obsidian" {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Can't use types here
    interface App {
        plugins: {
            disablePlugin: (id: string) => Promise<void>
            enablePlugin: (id: string) => Promise<void>
            plugins: Record<string, { manifest: PluginManifest } | undefined>
        }
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Can't use types here
    interface Window {
        app: App
    }
}
