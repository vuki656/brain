import { App, Notice, TFile } from "obsidian";

import { FRONTMATTER_KEY } from "./types";

const OLD_FRONTMATTER_VALUE = "board";
const IMP_PREFIX_REGEX = /^(- \[[ x]\] )!IMP! /gm;

export function migrateContent(content: string): string | null {
    const frontmatterMatch = content.match(/kanban-plugin:\s*(\S+)/);

    if (!frontmatterMatch || frontmatterMatch[1] !== OLD_FRONTMATTER_VALUE) {
        return null;
    }

    let migrated = content.replace(
        /kanban-plugin:\s*board/,
        `kanban-plugin: ${FRONTMATTER_KEY}`,
    );

    migrated = migrated.replace(IMP_PREFIX_REGEX, "$1");

    const archiveSeparatorIndex = migrated.indexOf("\n***\n");

    if (archiveSeparatorIndex !== -1) {
        const settingsBlockMatch = migrated.match(/%% kanban:settings[\s\S]*?%%/);
        const beforeArchive = migrated.substring(0, archiveSeparatorIndex);

        migrated = beforeArchive + "\n\n";

        if (settingsBlockMatch) {
            migrated += `%% kanban:settings\n\`\`\`json\n{"collapsed-columns":[]}\n\`\`\`\n%%`;
        } else {
            migrated += `%% kanban:settings\n\`\`\`json\n{}\n\`\`\`\n%%`;
        }
    }

    return migrated;
}

export async function migrateFromOldKanban(app: App): Promise<void> {
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile || !(activeFile instanceof TFile)) {
        new Notice("No active file to migrate.");
        return;
    }

    const content = await app.vault.read(activeFile);
    const migrated = migrateContent(content);

    if (!migrated) {
        new Notice("This file does not use the old kanban format (kanban-plugin: board).");
        return;
    }

    const backupPath = activeFile.path.replace(/\.md$/, "-backup.md");

    try {
        await app.vault.create(backupPath, content);
    } catch {
        new Notice(`Backup file already exists at ${backupPath}. Aborting migration.`);
        return;
    }

    await app.vault.modify(activeFile, migrated);

    new Notice(`Migration complete. Backup saved as ${backupPath}`);
}
