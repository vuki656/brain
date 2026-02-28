import { type App, Notice, requestUrl } from "obsidian"

import { BRAT_REPO, PLUGIN_ID } from "../../core/shared/constants"

export async function selfUpdate(app: App): Promise<void> {
    const pluginDirectory = `${app.vault.configDir}/plugins/${PLUGIN_ID}`
    const files = ["main.js", "manifest.json", "styles.css"]

    const currentManifestResponse = await app.vault.adapter.read(`${pluginDirectory}/manifest.json`)
    const currentVersion = JSON.parse(currentManifestResponse).version

    const manifestResponse = await requestUrl({
        url: `https://github.com/${BRAT_REPO}/releases/latest/download/manifest.json?cb=${Date.now()}`,
    })
    const latestVersion = JSON.parse(manifestResponse.text).version

    if (currentVersion === latestVersion) {
        new Notice(`Already on latest version (${currentVersion}).`)

        return
    }

    const downloadBase = `https://github.com/${BRAT_REPO}/releases/download/${latestVersion}`

    const downloads = await Promise.all(
        files.map(async (fileName) => {
            const response = await requestUrl({ url: `${downloadBase}/${fileName}` })

            return { content: response.text, fileName }
        }),
    )

    for (const download of downloads) {
        // eslint-disable-next-line no-await-in-loop -- sequential file writes are intentional
        await app.vault.adapter.write(`${pluginDirectory}/${download.fileName}`, download.content)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Obsidian internal API lacks types
    await (app as any).plugins.disablePlugin(PLUGIN_ID)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Obsidian internal API lacks types
    await (app as any).plugins.enablePlugin(PLUGIN_ID)

    new Notice(`Updated to ${latestVersion}. Plugin reloaded.`)
}
