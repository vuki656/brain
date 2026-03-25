import {
    type App,
    MarkdownView,
    Notice,
    requestUrl,
    TextFileView,
    type WorkspaceLeaf,
} from "obsidian"

import { BRAT_REPO, KANBAN_VIEW_TYPE, PLUGIN_ID } from "../../shared"

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

    const kanbanFilePaths: string[] = []

    app.workspace.iterateAllLeaves((leaf) => {
        if (
            leaf.view.getViewType() === KANBAN_VIEW_TYPE &&
            leaf.view instanceof TextFileView &&
            leaf.view.file
        ) {
            kanbanFilePaths.push(leaf.view.file.path)
        }
    })

    await app.plugins.disablePlugin(PLUGIN_ID)
    await app.plugins.loadManifests()
    await app.plugins.enablePlugin(PLUGIN_ID)

    const leavesToRestore: { filePath: string; leaf: WorkspaceLeaf }[] = []

    for (const filePath of kanbanFilePaths) {
        app.workspace.iterateAllLeaves((leaf) => {
            if (leaf.view instanceof MarkdownView && leaf.view.file?.path === filePath) {
                leavesToRestore.push({ filePath, leaf })
            }
        })
    }

    for (const { filePath, leaf } of leavesToRestore) {
        // eslint-disable-next-line no-await-in-loop -- sequential to avoid race conditions
        await leaf.setViewState({ state: { file: filePath }, type: "markdown" })
    }

    new Notice(`Updated to ${latestVersion}. Plugin reloaded.`)
}
