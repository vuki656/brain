import Sortable, { SortableEvent } from "sortablejs";
import { App, Menu, Notice, requestUrl, setIcon, TFile, Vault } from "obsidian";

import { generateId } from "./parser";
import { Board, Card, Column, Priority, ViewState, PluginSettings } from "./types";

const BRAT_REPO = "vuki656/brain";
const PLUGIN_ID = "obsidian-vuki-kanban";

async function selfUpdate(app: App): Promise<void> {
    const pluginDir = `${app.vault.configDir}/plugins/${PLUGIN_ID}`;
    const files = ["main.js", "manifest.json", "styles.css"];

    const currentManifestResponse = await app.vault.adapter.read(`${pluginDir}/manifest.json`);
    const currentVersion = JSON.parse(currentManifestResponse).version;

    const manifestResponse = await requestUrl({
        url: `https://github.com/${BRAT_REPO}/releases/latest/download/manifest.json?cb=${Date.now()}`,
    });
    const latestVersion = JSON.parse(manifestResponse.text).version;

    if (currentVersion === latestVersion) {
        new Notice(`Already on latest version (${currentVersion}).`);
        return;
    }

    const downloadBase = `https://github.com/${BRAT_REPO}/releases/download/${latestVersion}`;

    const downloads = await Promise.all(
        files.map(async (fileName) => {
            const response = await requestUrl({ url: `${downloadBase}/${fileName}` });

            return { fileName, content: response.text };
        }),
    );

    for (const download of downloads) {
        await app.vault.adapter.write(`${pluginDir}/${download.fileName}`, download.content);
    }

    await (app as any).plugins.disablePlugin(PLUGIN_ID);
    await (app as any).plugins.enablePlugin(PLUGIN_ID);

    new Notice(`Updated to ${latestVersion}. Plugin reloaded.`);
}

type MutationHandler = (board: Board) => void;

type TodayCard = {
    card: Card;
    columnIndex: number;
    cardIndex: number;
    columnTitle: string;
};

const COLUMN_COLORS = [
    "var(--color-blue)",
    "var(--color-purple)",
    "var(--color-green)",
    "var(--color-orange)",
    "var(--color-red)",
    "var(--color-yellow)",
    "var(--color-cyan)",
    "var(--color-pink)",
];

function getColumnColor(columnIndex: number): string {
    return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length];
}

function immutableSpliceCard(
    columns: Column[],
    columnIndex: number,
    cardIndex: number,
    deleteCount: number,
    ...insertCards: Card[]
): Column[] {
    return columns.map((column, index) => {
        if (index !== columnIndex) return column;

        const newCards = [...column.cards];
        newCards.splice(cardIndex, deleteCount, ...insertCards);

        return { ...column, cards: newCards };
    });
}

function immutableUpdateCard(columns: Column[], columnIndex: number, cardIndex: number, update: Partial<Card>): Column[] {
    return columns.map((column, colIndex) => {
        if (colIndex !== columnIndex) return column;

        return {
            ...column,
            cards: column.cards.map((card, cIndex) => {
                if (cIndex !== cardIndex) return card;

                return { ...card, ...update };
            }),
        };
    });
}

function toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
}

function getNextMonday(): Date {
    const date = new Date();
    const daysUntilMonday = ((8 - date.getDay()) % 7) || 7;

    date.setDate(date.getDate() + daysUntilMonday);

    return date;
}

function showDatePicker(
    anchorEvent: MouseEvent,
    card: Card,
    columnIndex: number,
    cardIndex: number,
    board: Board,
    onMutation: MutationHandler,
): void {
    const overlay = document.createElement("div");

    overlay.className = "kanban-date-picker-overlay";

    const picker = document.createElement("input");

    picker.type = "date";
    picker.className = "kanban-date-picker";
    if (card.date) picker.value = card.date;

    picker.style.position = "fixed";
    picker.style.left = `${anchorEvent.clientX}px`;
    picker.style.top = `${anchorEvent.clientY}px`;

    const cleanup = () => {
        overlay.remove();
        picker.remove();
    };

    overlay.addEventListener("click", cleanup);

    picker.addEventListener("change", () => {
        if (picker.value) {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: picker.value });

            onMutation({ ...board, columns: newColumns });
        }

        cleanup();
    });

    picker.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Escape") cleanup();
    });

    document.body.appendChild(overlay);
    document.body.appendChild(picker);
    picker.showPicker();
}

function isCardVisibleInTodayFilter(card: Card): boolean {
    if (card.completed) return false;
    if (card.today) return true;

    if (card.date) {
        const cardDate = new Date(card.date);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        cardDate.setHours(0, 0, 0, 0);

        return cardDate.getTime() <= today.getTime();
    }

    return false;
}

function formatDate(dateString: string): string {
    const cardDate = new Date(dateString);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    cardDate.setHours(0, 0, 0, 0);

    const differenceInDays = Math.round((cardDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) return "Today";
    if (differenceInDays === 1) return "Tomorrow";
    if (differenceInDays === -1) return "Yesterday";
    if (differenceInDays < -1) return `${Math.abs(differenceInDays)} days ago`;
    if (differenceInDays <= 7) return `In ${differenceInDays} days`;

    return dateString;
}

function collectTodayCards(board: Board): TodayCard[] {
    const todayCards: TodayCard[] = [];

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex];

        for (let cardIndex = 0; cardIndex < column.cards.length; cardIndex++) {
            const card = column.cards[cardIndex];

            if (isCardVisibleInTodayFilter(card)) {
                todayCards.push({
                    card,
                    columnIndex,
                    cardIndex,
                    columnTitle: column.title,
                });
            }
        }
    }

    const savedOrder = board.settings.todayOrder;

    if (savedOrder.length > 0) {
        todayCards.sort((first, second) => {
            const indexOfFirst = savedOrder.indexOf(first.card.id);
            const indexOfSecond = savedOrder.indexOf(second.card.id);
            const effectiveFirst = indexOfFirst === -1 ? savedOrder.length : indexOfFirst;
            const effectiveSecond = indexOfSecond === -1 ? savedOrder.length : indexOfSecond;

            return effectiveFirst - effectiveSecond;
        });
    }

    return todayCards;
}

function createCardElement(
    card: Card,
    columnIndex: number,
    cardIndex: number,
    board: Board,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
    projectPill: { title: string; color: string } | null,
): HTMLElement {
    const cardElement = document.createElement("div");

    cardElement.className = "kanban-card";
    cardElement.dataset.columnIndex = String(columnIndex);
    cardElement.dataset.cardIndex = String(cardIndex);
    cardElement.dataset.cardId = card.id;

    if (card.completed) cardElement.classList.add("kanban-card--completed");
    if (card.priority) cardElement.dataset.priority = card.priority;

    const cardContent = document.createElement("div");

    cardContent.className = "kanban-card__content";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "kanban-card__checkbox task-list-item-checkbox";
    checkbox.checked = card.completed;
    checkbox.addEventListener("change", () => {
        const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { completed: checkbox.checked });
        onMutation({ ...board, columns: newColumns });
    });

    const titleElement = document.createElement("span");

    titleElement.className = "kanban-card__title";

    if (card.linkedNote) {
        const link = document.createElement("a");

        link.className = "internal-link";
        link.href = card.linkedNote;
        link.textContent = card.linkedNote;
        link.dataset.href = card.linkedNote;
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const file = vault.getAbstractFileByPath(`${card.linkedNote}.md`);

            if (file && file instanceof TFile) {
                (window as any).app.workspace.getLeaf(false).openFile(file);
            }
        });

        titleElement.appendChild(link);
    } else {
        titleElement.textContent = card.title;
    }

    titleElement.addEventListener("dblclick", () => {
        startInlineEdit(titleElement, card.linkedNote ?? card.title, (newValue) => {
            const update = card.linkedNote ? { linkedNote: newValue } : { title: newValue };
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, update);
            onMutation({ ...board, columns: newColumns });
        });
    });

    cardContent.appendChild(checkbox);
    cardContent.appendChild(titleElement);

    const priorityButton = document.createElement("span");

    priorityButton.className = "kanban-card__priority-dot";
    priorityButton.dataset.priority = card.priority ?? "none";
    priorityButton.addEventListener("click", (event) => {
        event.stopPropagation();
        showPriorityMenu(event, card, columnIndex, cardIndex, board, onMutation);
    });

    cardContent.appendChild(priorityButton);
    cardElement.appendChild(cardContent);

    const metaRow = document.createElement("div");

    metaRow.className = "kanban-card__meta";

    if (projectPill) {
        const pillElement = document.createElement("span");

        pillElement.className = "kanban-card__project-pill";
        pillElement.textContent = projectPill.title;
        pillElement.style.background = projectPill.color;
        metaRow.appendChild(pillElement);
    }

    if (card.today) {
        const todayBadge = document.createElement("span");

        todayBadge.className = "kanban-card__badge kanban-card__badge--today";
        todayBadge.textContent = "today";
        metaRow.appendChild(todayBadge);
    }

    if (card.date) {
        const dateBadge = document.createElement("span");
        const isOverdue = new Date(card.date) < new Date(new Date().toDateString()) && !card.completed;

        dateBadge.className = "kanban-card__badge kanban-card__badge--date";
        if (isOverdue) dateBadge.classList.add("kanban-card__badge--overdue");
        dateBadge.textContent = formatDate(card.date);
        metaRow.appendChild(dateBadge);
    }

    if (metaRow.children.length > 0) {
        cardElement.appendChild(metaRow);
    }

    cardElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        showCardContextMenu(event, card, columnIndex, cardIndex, board, onMutation, vault, pluginSettings);
    });

    return cardElement;
}

function showPriorityMenu(
    event: MouseEvent,
    card: Card,
    columnIndex: number,
    cardIndex: number,
    board: Board,
    onMutation: MutationHandler,
): void {
    const menu = new Menu();

    menu.addItem((item) =>
        item.setTitle("None").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: null });
            onMutation({ ...board, columns: newColumns });
        }),
    );

    menu.addItem((item) =>
        item.setTitle("Important").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: "important" });
            onMutation({ ...board, columns: newColumns });
        }),
    );

    menu.showAtMouseEvent(event);
}

function showCardContextMenu(
    event: MouseEvent,
    card: Card,
    columnIndex: number,
    cardIndex: number,
    board: Board,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
): void {
    const menu = new Menu();

    if (card.today) {
        menu.addItem((item) =>
            item.setTitle("Remove from today").onClick(() => {
                const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { today: false });
                onMutation({ ...board, columns: newColumns });
            }),
        );
    } else {
        menu.addItem((item) =>
            item.setTitle("Add to today").onClick(() => {
                const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { today: true });
                onMutation({ ...board, columns: newColumns });
            }),
        );
    }

    menu.addSeparator();

    menu.addItem((item) =>
        item.setTitle("Priority: None").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: null });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setTitle("Priority: Important").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: "important" });
            onMutation({ ...board, columns: newColumns });
        }),
    );

    menu.addSeparator();

    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    menu.addItem((item) =>
        item.setTitle("Date: Today").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: toDateString(today) });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setTitle("Date: Tomorrow").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: toDateString(tomorrow) });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setTitle("Date: Next Monday").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: toDateString(getNextMonday()) });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setTitle("Date: Pick...").onClick(() => {
            showDatePicker(event, card, columnIndex, cardIndex, board, onMutation);
        }),
    );

    if (card.date) {
        menu.addItem((item) =>
            item.setTitle("Date: Remove").onClick(() => {
                const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: null });
                onMutation({ ...board, columns: newColumns });
            }),
        );
    }

    menu.addSeparator();

    if (!card.linkedNote) {
        menu.addItem((item) =>
            item.setTitle("Create linked note").onClick(async () => {
                const columnTitle = board.columns[columnIndex].title;
                const cardTitle = card.title;
                const notePath = `${pluginSettings.notePathPrefix}/${columnTitle}/Tasks/${cardTitle}.md`;

                const folderPath = notePath.substring(0, notePath.lastIndexOf("/"));

                try {
                    if (!vault.getAbstractFileByPath(folderPath)) {
                        await vault.createFolder(folderPath);
                    }

                    await vault.create(notePath, `# ${cardTitle}\n`);

                    const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, {
                        linkedNote: `${pluginSettings.notePathPrefix}/${columnTitle}/Tasks/${cardTitle}`,
                        title: "",
                    });
                    onMutation({ ...board, columns: newColumns });

                    new Notice(`Created note: ${notePath}`);
                } catch (error) {
                    new Notice(`Failed to create note: ${error}`);
                }
            }),
        );
    }

    menu.addSeparator();

    menu.addItem((item) =>
        item
            .setTitle("Delete card")
            .setWarning(true)
            .onClick(() => {
                const newColumns = immutableSpliceCard(board.columns, columnIndex, cardIndex, 1);
                onMutation({ ...board, columns: newColumns });
            }),
    );

    menu.showAtMouseEvent(event);
}

function startInlineEdit(element: HTMLElement, currentValue: string, onConfirm: (newValue: string) => void): void {
    const input = document.createElement("input");

    input.type = "text";
    input.className = "kanban-inline-edit";
    input.value = currentValue;

    const originalContent = element.innerHTML;

    element.textContent = "";
    element.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
        const newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            onConfirm(newValue);
        } else {
            element.innerHTML = originalContent;
        }
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            input.blur();
        }
        if (event.key === "Escape") {
            element.innerHTML = originalContent;
        }
    });
}

function createAddCardForm(columnIndex: number, board: Board, onMutation: MutationHandler): HTMLElement {
    const wrapper = document.createElement("div");

    wrapper.className = "kanban-add-card";

    const button = document.createElement("button");

    button.className = "kanban-add-card__button";
    button.textContent = "+ Add a card";
    button.addEventListener("click", () => {
        button.style.display = "none";

        const textarea = document.createElement("textarea");

        textarea.className = "kanban-add-card__input";
        textarea.placeholder = "Card title...";
        wrapper.appendChild(textarea);
        textarea.focus();

        const confirm = () => {
            const text = textarea.value.trim();

            if (text) {
                const newCard: Card = {
                    title: text,
                    completed: false,
                    today: false,
                    priority: null,
                    date: null,
                    linkedNote: null,
                    id: generateId(),
                };
                const newColumns = immutableSpliceCard(board.columns, columnIndex, board.columns[columnIndex].cards.length, 0, newCard);
                onMutation({ ...board, columns: newColumns });
            }

            textarea.remove();
            button.style.display = "";
        };

        textarea.addEventListener("blur", confirm);
        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                textarea.blur();
            }
            if (event.key === "Escape") {
                textarea.remove();
                button.style.display = "";
            }
        });
    });

    wrapper.appendChild(button);

    return wrapper;
}

function createColumnElement(
    column: Column,
    columnIndex: number,
    board: Board,
    viewState: ViewState,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
): HTMLElement {
    const isCollapsed = board.settings.collapsedColumns.includes(column.title);
    const columnElement = document.createElement("div");

    columnElement.className = "kanban-column";
    columnElement.dataset.columnIndex = String(columnIndex);
    if (isCollapsed) {
        columnElement.classList.add("kanban-column--collapsed");
        columnElement.addEventListener("click", () => {
            const newCollapsed = board.settings.collapsedColumns.filter((name) => name !== column.title);

            onMutation({
                ...board,
                settings: { ...board.settings, collapsedColumns: newCollapsed },
            });
        });
    }

    const header = document.createElement("div");

    header.className = "kanban-column__header";

    const titleElement = document.createElement("div");

    titleElement.className = "kanban-column__title";
    titleElement.textContent = column.title;

    titleElement.addEventListener("dblclick", () => {
        startInlineEdit(titleElement, column.title, (newTitle) => {
            const wasCollapsed = board.settings.collapsedColumns.includes(column.title);
            const newColumns = board.columns.map((col, index) => (index === columnIndex ? { ...col, title: newTitle } : col));
            let newCollapsedColumns = [...board.settings.collapsedColumns];

            if (wasCollapsed) {
                newCollapsedColumns = newCollapsedColumns.map((name) => (name === column.title ? newTitle : name));
            }

            onMutation({
                ...board,
                columns: newColumns,
                settings: { ...board.settings, collapsedColumns: newCollapsedColumns },
            });
        });
    });

    const visibleCardCount = viewState.hideCompletedActive
        ? column.cards.filter((card) => !card.completed).length
        : column.cards.length;

    const countBadge = document.createElement("span");

    countBadge.className = "kanban-column__count";
    countBadge.textContent = String(visibleCardCount);

    const collapseButton = document.createElement("span");

    collapseButton.className = "kanban-column__collapse-btn";
    collapseButton.textContent = isCollapsed ? "+" : "−";
    collapseButton.addEventListener("click", () => {
        let newCollapsed: string[];

        if (isCollapsed) {
            newCollapsed = board.settings.collapsedColumns.filter((name) => name !== column.title);
        } else {
            newCollapsed = [...board.settings.collapsedColumns, column.title];
        }

        onMutation({
            ...board,
            settings: { ...board.settings, collapsedColumns: newCollapsed },
        });
    });

    const dragHandle = document.createElement("span");

    dragHandle.className = "kanban-column__drag-handle";
    setIcon(dragHandle, "grip-vertical");

    header.appendChild(dragHandle);
    header.appendChild(titleElement);
    header.appendChild(countBadge);
    header.appendChild(collapseButton);

    header.addEventListener("contextmenu", (event) => {
        event.preventDefault();

        const menu = new Menu();

        menu.addItem((item) =>
            item
                .setTitle("Delete column")
                .setWarning(true)
                .onClick(() => {
                    if (column.cards.length > 0) {
                        new Notice("Cannot delete a column that still has cards.");
                        return;
                    }

                    const newColumns = board.columns.filter((_, index) => index !== columnIndex);
                    const newCollapsed = board.settings.collapsedColumns.filter((name) => name !== column.title);

                    onMutation({
                        ...board,
                        columns: newColumns,
                        settings: { ...board.settings, collapsedColumns: newCollapsed },
                    });
                }),
        );

        menu.showAtMouseEvent(event);
    });

    columnElement.appendChild(header);

    if (!isCollapsed) {
        const cardList = document.createElement("div");

        cardList.className = "kanban-column__cards";
        cardList.dataset.columnIndex = String(columnIndex);

        for (let cardIndex = 0; cardIndex < column.cards.length; cardIndex++) {
            const card = column.cards[cardIndex];

            cardList.appendChild(createCardElement(card, columnIndex, cardIndex, board, onMutation, vault, pluginSettings, null));
        }

        columnElement.appendChild(cardList);
        columnElement.appendChild(createAddCardForm(columnIndex, board, onMutation));
    }

    return columnElement;
}

function setButtonContent(button: HTMLElement, iconName: string, label: string): void {
    button.empty();

    const iconSpan = button.createSpan({ cls: "kanban-toolbar__button-icon" });

    setIcon(iconSpan, iconName);

    button.createSpan({ text: label });
}

function createToolbar(viewState: ViewState, onViewStateChange: (viewState: ViewState) => void, app: App): HTMLElement {
    const toolbar = document.createElement("div");

    toolbar.className = "kanban-toolbar";

    const todayButton = document.createElement("button");

    todayButton.className = "kanban-toolbar__button";
    if (viewState.todayFilterActive) todayButton.classList.add("kanban-toolbar__button--active");
    setButtonContent(todayButton, viewState.todayFilterActive ? "calendar-check" : "sun", "Today");
    todayButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, todayFilterActive: !viewState.todayFilterActive });
    });

    const hideCompletedButton = document.createElement("button");

    hideCompletedButton.className = "kanban-toolbar__button";
    if (viewState.hideCompletedActive) hideCompletedButton.classList.add("kanban-toolbar__button--active");
    setButtonContent(hideCompletedButton, viewState.hideCompletedActive ? "eye-off" : "eye", "Hide completed");
    hideCompletedButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, hideCompletedActive: !viewState.hideCompletedActive });
    });

    const toolbarSpacer = document.createElement("div");

    toolbarSpacer.className = "kanban-toolbar__spacer";

    const updateButton = document.createElement("button");

    updateButton.className = "kanban-toolbar__button kanban-toolbar__button--update";
    setButtonContent(updateButton, "download", "Update");
    updateButton.addEventListener("click", async () => {
        setButtonContent(updateButton, "loader-2", "Updating...");
        updateButton.disabled = true;

        try {
            await selfUpdate(app);
        } catch (error) {
            new Notice(`Update failed: ${error}`);
        }

        setButtonContent(updateButton, "download", "Update");
        updateButton.disabled = false;
    });

    toolbar.appendChild(todayButton);
    toolbar.appendChild(hideCompletedButton);
    toolbar.appendChild(toolbarSpacer);
    toolbar.appendChild(updateButton);

    return toolbar;
}

function createAddColumnButton(board: Board, onMutation: MutationHandler): HTMLElement {
    const button = document.createElement("button");

    button.className = "kanban-add-column__button";
    button.textContent = "+ Add column";
    button.addEventListener("click", () => {
        const name = "New Column";
        const newColumn: Column = { title: name, cards: [] };

        onMutation({
            ...board,
            columns: [...board.columns, newColumn],
        });
    });

    return button;
}

function renderTodayView(
    container: HTMLElement,
    board: Board,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
): Sortable[] {
    const todayCards = collectTodayCards(board);
    const todayList = document.createElement("div");

    todayList.className = "kanban-today";

    const todayHeader = document.createElement("div");

    todayHeader.className = "kanban-today__header";

    const todayTitle = document.createElement("div");

    todayTitle.className = "kanban-today__title";
    todayTitle.textContent = "Today";

    const todayCount = document.createElement("span");

    todayCount.className = "kanban-today__count";
    todayCount.textContent = String(todayCards.length);

    todayHeader.appendChild(todayTitle);
    todayHeader.appendChild(todayCount);
    todayList.appendChild(todayHeader);

    const cardListElement = document.createElement("div");

    cardListElement.className = "kanban-today__cards";

    for (const todayCard of todayCards) {
        const pill = {
            title: todayCard.columnTitle,
            color: getColumnColor(todayCard.columnIndex),
        };

        const cardElement = createCardElement(
            todayCard.card,
            todayCard.columnIndex,
            todayCard.cardIndex,
            board,
            onMutation,
            vault,
            pluginSettings,
            pill,
        );

        cardListElement.appendChild(cardElement);
    }

    todayList.appendChild(cardListElement);
    container.appendChild(todayList);

    const sortableInstances: Sortable[] = [];

    const instance = Sortable.create(cardListElement, {
        animation: 150,
        forceFallback: true,
        fallbackOnBody: true,
        fallbackClass: "kanban-card--dragging",
        ghostClass: "kanban-card--ghost",
        dragClass: "kanban-card--drag",
        onEnd: () => {
            const cardElements = cardListElement.querySelectorAll<HTMLElement>(".kanban-card");
            const newTodayOrder: string[] = [];

            cardElements.forEach((element) => {
                const cardId = element.dataset.cardId;

                if (cardId) {
                    newTodayOrder.push(cardId);
                }
            });

            onMutation({
                ...board,
                settings: { ...board.settings, todayOrder: newTodayOrder },
            });
        },
    });

    sortableInstances.push(instance);

    return sortableInstances;
}

function renderBoardColumns(
    container: HTMLElement,
    board: Board,
    viewState: ViewState,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
): Sortable[] {
    const boardElement = document.createElement("div");

    boardElement.className = "kanban-board";
    container.appendChild(boardElement);

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex];
        const columnElement = createColumnElement(column, columnIndex, board, viewState, onMutation, vault, pluginSettings);

        boardElement.appendChild(columnElement);
    }

    boardElement.appendChild(createAddColumnButton(board, onMutation));

    const sortableInstances: Sortable[] = [];

    const columnSortable = Sortable.create(boardElement, {
        animation: 150,
        handle: ".kanban-column__drag-handle",
        draggable: ".kanban-column",
        forceFallback: true,
        fallbackOnBody: true,
        fallbackClass: "kanban-column--dragging",
        ghostClass: "kanban-column--ghost",
        onEnd: (event: SortableEvent) => {
            const oldIndex = event.oldIndex;
            const newIndex = event.newIndex;

            if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;

            const newColumns = [...board.columns];
            const [moved] = newColumns.splice(oldIndex, 1);

            newColumns.splice(newIndex, 0, moved);
            onMutation({ ...board, columns: newColumns });
        },
    });

    sortableInstances.push(columnSortable);

    const cardLists = boardElement.querySelectorAll<HTMLElement>(".kanban-column__cards");

    cardLists.forEach((cardList) => {
        const instance = Sortable.create(cardList, {
            group: "kanban-cards",
            animation: 150,
            forceFallback: true,
            fallbackOnBody: true,
            fallbackClass: "kanban-card--dragging",
            ghostClass: "kanban-card--ghost",
            dragClass: "kanban-card--drag",
            onEnd: (event: SortableEvent) => {
                const fromColumnIndex = Number(event.from.dataset.columnIndex);
                const toColumnIndex = Number(event.to.dataset.columnIndex);
                const oldIndex = event.oldIndex;
                const newIndex = event.newIndex;

                if (oldIndex === undefined || newIndex === undefined) return;

                const card = board.columns[fromColumnIndex].cards[oldIndex];
                let newColumns = immutableSpliceCard(board.columns, fromColumnIndex, oldIndex, 1);

                const adjustedToIndex = fromColumnIndex === toColumnIndex && newIndex > oldIndex ? newIndex - 1 : newIndex;
                newColumns = immutableSpliceCard(newColumns, toColumnIndex, adjustedToIndex, 0, card);

                onMutation({ ...board, columns: newColumns });
            },
        });

        sortableInstances.push(instance);
    });

    return sortableInstances;
}

export function renderBoard(
    container: HTMLElement,
    board: Board,
    viewState: ViewState,
    onMutation: MutationHandler,
    onViewStateChange: (viewState: ViewState) => void,
    vault: Vault,
    pluginSettings: PluginSettings,
    app: App,
): Sortable[] {
    const previousBoard = container.querySelector(".kanban-board");
    const savedScrollLeft = previousBoard ? previousBoard.scrollLeft : 0;

    container.empty();

    if (viewState.hideCompletedActive) {
        container.dataset.hideCompleted = "true";
    } else {
        delete container.dataset.hideCompleted;
    }

    const toolbar = createToolbar(viewState, onViewStateChange, app);

    container.appendChild(toolbar);

    if (viewState.todayFilterActive) {
        return renderTodayView(container, board, onMutation, vault, pluginSettings);
    }

    const sortableInstances = renderBoardColumns(container, board, viewState, onMutation, vault, pluginSettings);
    const newBoard = container.querySelector(".kanban-board");

    if (newBoard) newBoard.scrollLeft = savedScrollLeft;

    return sortableInstances;
}
