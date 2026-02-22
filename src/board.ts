import Sortable, { SortableEvent } from "sortablejs";
import { App, Menu, Notice, requestUrl, setIcon, TFile, Vault } from "obsidian";

import { immutableSpliceCard, immutableUpdateCard, toDateString, getNextMonday, formatDate } from "./board-utils";
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

type DateGroup = {
    label: string;
    dateKey: string;
    cards: TodayCard[];
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

const COLUMN_COLOR_LABELS: Record<string, string> = {
    "var(--color-blue)": "Blue",
    "var(--color-purple)": "Purple",
    "var(--color-green)": "Green",
    "var(--color-orange)": "Orange",
    "var(--color-red)": "Red",
    "var(--color-yellow)": "Yellow",
    "var(--color-cyan)": "Cyan",
    "var(--color-pink)": "Pink",
};

function getColumnColor(columnTitle: string, columnIndex: number, board: Board): string {
    const customColor = board.settings.columnColors[columnTitle];

    if (customColor) return customColor;

    return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length];
}


function showDatePicker(
    card: Card,
    columnIndex: number,
    cardIndex: number,
    board: Board,
    onMutation: MutationHandler,
): void {
    const selectedDate = card.date ? new Date(card.date + "T00:00:00") : new Date();
    let viewYear = selectedDate.getFullYear();
    let viewMonth = selectedDate.getMonth();

    const overlay = document.createElement("div");

    overlay.className = "kanban-date-picker-overlay";

    const modal = document.createElement("div");

    modal.className = "kanban-date-picker-modal";

    const cleanup = () => {
        overlay.remove();
        modal.remove();
    };

    overlay.addEventListener("click", cleanup);

    const onSelect = (dateString: string) => {
        const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: dateString });

        onMutation({ ...board, columns: newColumns });
        cleanup();
    };

    const renderCalendar = () => {
        modal.empty();

        const header = document.createElement("div");

        header.className = "kanban-date-picker__header";

        const prevButton = document.createElement("span");

        prevButton.className = "kanban-date-picker__nav";
        prevButton.textContent = "\u2039";
        prevButton.addEventListener("click", () => {
            viewMonth--;
            if (viewMonth < 0) {
                viewMonth = 11;
                viewYear--;
            }
            renderCalendar();
        });

        const nextButton = document.createElement("span");

        nextButton.className = "kanban-date-picker__nav";
        nextButton.textContent = "\u203A";
        nextButton.addEventListener("click", () => {
            viewMonth++;
            if (viewMonth > 11) {
                viewMonth = 0;
                viewYear++;
            }
            renderCalendar();
        });

        const monthLabel = document.createElement("span");
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        monthLabel.className = "kanban-date-picker__month-label";
        monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;

        header.appendChild(prevButton);
        header.appendChild(monthLabel);
        header.appendChild(nextButton);
        modal.appendChild(header);

        const grid = document.createElement("div");

        grid.className = "kanban-date-picker__grid";

        const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

        for (const dayLabel of dayLabels) {
            const cell = document.createElement("div");

            cell.className = "kanban-date-picker__day-label";
            cell.textContent = dayLabel;
            grid.appendChild(cell);
        }

        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;
        const todayString = toDateString(new Date());

        for (let padding = 0; padding < startDayOfWeek; padding++) {
            const empty = document.createElement("div");

            empty.className = "kanban-date-picker__cell kanban-date-picker__cell--empty";
            grid.appendChild(empty);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const cell = document.createElement("div");
            const cellDate = new Date(viewYear, viewMonth, day);
            const cellDateString = toDateString(cellDate);

            cell.className = "kanban-date-picker__cell";
            cell.textContent = String(day);

            if (cellDateString === todayString) {
                cell.classList.add("kanban-date-picker__cell--today");
            }

            if (card.date && cellDateString === card.date) {
                cell.classList.add("kanban-date-picker__cell--selected");
            }

            cell.addEventListener("click", () => {
                onSelect(cellDateString);
            });

            grid.appendChild(cell);
        }

        modal.appendChild(grid);
    };

    renderCalendar();
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

function isCardVisibleInTodayFilter(card: Card): boolean {
    if (card.completed) return false;
    if (card.date) return true;

    return false;
}


function sortCardsByOrder(cards: TodayCard[], savedOrder: string[]): TodayCard[] {
    if (savedOrder.length === 0) return cards;

    const sorted = [...cards];

    sorted.sort((first, second) => {
        const indexOfFirst = savedOrder.indexOf(first.card.id);
        const indexOfSecond = savedOrder.indexOf(second.card.id);
        const effectiveFirst = indexOfFirst === -1 ? savedOrder.length : indexOfFirst;
        const effectiveSecond = indexOfSecond === -1 ? savedOrder.length : indexOfSecond;

        return effectiveFirst - effectiveSecond;
    });

    return sorted;
}

function formatDateGroupLabel(dateString: string): string {
    const cardDate = new Date(dateString + "T00:00:00");
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    cardDate.setHours(0, 0, 0, 0);

    const differenceInDays = Math.round((cardDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 1) return "Tomorrow";
    if (differenceInDays <= 7) return `In ${differenceInDays} days`;

    return dateString;
}

function collectCardsByDateGroup(board: Board): DateGroup[] {
    const todayString = toDateString(new Date());
    const overdueCards: TodayCard[] = [];
    const todayCards: TodayCard[] = [];
    const futureBuckets = new Map<string, TodayCard[]>();

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex];

        for (let cardIndex = 0; cardIndex < column.cards.length; cardIndex++) {
            const card = column.cards[cardIndex];

            if (!isCardVisibleInTodayFilter(card)) continue;

            const todayCard: TodayCard = {
                card,
                columnIndex,
                cardIndex,
                columnTitle: column.title,
            };

            if (card.date) {
                if (card.date < todayString) {
                    overdueCards.push(todayCard);
                } else if (card.date === todayString) {
                    todayCards.push(todayCard);
                } else {
                    const existing = futureBuckets.get(card.date);

                    if (existing) {
                        existing.push(todayCard);
                    } else {
                        futureBuckets.set(card.date, [todayCard]);
                    }
                }
            }
        }
    }

    const savedOrder = board.settings.todayOrder;
    const groups: DateGroup[] = [];

    if (overdueCards.length > 0) {
        groups.push({
            label: "Overdue",
            dateKey: "overdue",
            cards: sortCardsByOrder(overdueCards, savedOrder["overdue"] ?? []),
        });
    }

    if (todayCards.length > 0) {
        groups.push({
            label: "Today",
            dateKey: "today",
            cards: sortCardsByOrder(todayCards, savedOrder["today"] ?? []),
        });
    }

    const sortedFutureDates = [...futureBuckets.keys()].sort();

    for (const dateKey of sortedFutureDates) {
        const cards = futureBuckets.get(dateKey)!;

        groups.push({
            label: formatDateGroupLabel(dateKey),
            dateKey,
            cards: sortCardsByOrder(cards, savedOrder[dateKey] ?? []),
        });
    }

    return groups;
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
        link.textContent = card.linkedNote.split("/").pop() ?? card.linkedNote;
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

    const dragHandle = document.createElement("span");

    dragHandle.className = "kanban-card__drag-handle";
    setIcon(dragHandle, "grip-vertical");
    dragHandle.addEventListener("contextmenu", (handleEvent) => {
        handleEvent.stopPropagation();
        handleEvent.preventDefault();
    });

    cardContent.appendChild(dragHandle);
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

    if (card.date && !projectPill) {
        const dateBadge = document.createElement("span");
        const isToday = card.date === toDateString(new Date());
        const isOverdue = new Date(card.date) < new Date(new Date().toDateString()) && !card.completed;

        dateBadge.className = isToday
            ? "kanban-card__badge kanban-card__badge--today"
            : "kanban-card__badge kanban-card__badge--date";
        if (isOverdue) dateBadge.classList.add("kanban-card__badge--overdue");
        dateBadge.textContent = isToday ? "Today" : formatDate(card.date);
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
        item.setIcon("circle").setTitle("None").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: null });
            onMutation({ ...board, columns: newColumns });
        }),
    );

    menu.addItem((item) =>
        item.setIcon("alert-circle").setTitle("Important").onClick(() => {
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

    const todayString = toDateString(new Date());

    if (card.date === todayString) {
        menu.addItem((item) =>
            item.setIcon("sun-dim").setTitle("Remove from today").onClick(() => {
                const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: null });
                onMutation({ ...board, columns: newColumns });
            }),
        );
    } else {
        menu.addItem((item) =>
            item.setIcon("sun").setTitle("Add to today").onClick(() => {
                const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: todayString });
                onMutation({ ...board, columns: newColumns });
            }),
        );
    }

    menu.addSeparator();

    menu.addItem((item) =>
        item.setIcon("circle").setTitle("Priority: None").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: null });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setIcon("alert-circle").setTitle("Priority: Important").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: "important" });
            onMutation({ ...board, columns: newColumns });
        }),
    );

    menu.addSeparator();

    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    menu.addItem((item) =>
        item.setIcon("calendar").setTitle("Date: Today").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: toDateString(today) });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setIcon("calendar-plus").setTitle("Date: Tomorrow").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: toDateString(tomorrow) });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setIcon("calendar-range").setTitle("Date: Next Monday").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: toDateString(getNextMonday()) });
            onMutation({ ...board, columns: newColumns });
        }),
    );
    menu.addItem((item) =>
        item.setIcon("calendar-search").setTitle("Date: Pick...").onClick(() => {
            showDatePicker(card, columnIndex, cardIndex, board, onMutation);
        }),
    );

    if (card.date) {
        menu.addItem((item) =>
            item.setIcon("calendar-x").setTitle("Date: Remove").onClick(() => {
                const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { date: null });
                onMutation({ ...board, columns: newColumns });
            }),
        );
    }

    menu.addSeparator();

    if (!card.linkedNote) {
        menu.addItem((item) =>
            item.setIcon("file-plus").setTitle("Create linked note").onClick(async () => {
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
    } else {
        menu.addItem((item) =>
            item
                .setIcon("file-x")
                .setTitle("Delete linked note")
                .setWarning(true)
                .onClick(async () => {
                    const notePath = `${card.linkedNote}.md`;
                    const file = vault.getAbstractFileByPath(notePath);

                    if (file && file instanceof TFile) {
                        try {
                            await vault.trash(file, true);

                            const noteName = card.linkedNote!.split("/").pop() ?? card.linkedNote!;
                            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, {
                                linkedNote: null,
                                title: noteName,
                            });
                            onMutation({ ...board, columns: newColumns });

                            new Notice(`Deleted note: ${notePath}`);
                        } catch (error) {
                            new Notice(`Failed to delete note: ${error}`);
                        }
                    } else {
                        new Notice(`Note not found: ${notePath}`);
                    }
                }),
        );
    }

    menu.addSeparator();

    menu.addItem((item) =>
        item
            .setIcon("trash-2")
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

    const originalChildren: Node[] = [];

    while (element.firstChild) {
        originalChildren.push(element.removeChild(element.firstChild));
    }

    element.appendChild(input);
    input.focus();
    input.select();

    const restoreOriginal = () => {
        input.remove();

        for (const child of originalChildren) {
            element.appendChild(child);
        }
    };

    const commit = () => {
        const newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            onConfirm(newValue);
        } else {
            restoreOriginal();
        }
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            input.blur();
        }
        if (event.key === "Escape") {
            input.removeEventListener("blur", commit);
            restoreOriginal();
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

    const dragHandle = document.createElement("span");

    dragHandle.className = "kanban-column__drag-handle";
    setIcon(dragHandle, "grip-vertical");

    const colorDot = document.createElement("span");

    colorDot.className = "kanban-column__color-dot";
    colorDot.style.background = getColumnColor(column.title, columnIndex, board);

    header.appendChild(dragHandle);
    header.appendChild(colorDot);
    header.appendChild(titleElement);
    header.appendChild(countBadge);

    header.addEventListener("contextmenu", (event) => {
        event.preventDefault();

        const menu = new Menu();

        menu.addItem((item) =>
            item.setIcon("eye-off").setTitle("Hide column").onClick(() => {
                const newCollapsed = [...board.settings.collapsedColumns, column.title];

                onMutation({
                    ...board,
                    settings: { ...board.settings, collapsedColumns: newCollapsed },
                });
            }),
        );

        menu.addItem((item) =>
            item.setIcon("palette").setTitle("Color").onClick((event) => {
                const colorMenu = new Menu();

                for (const color of COLUMN_COLORS) {
                    const label = COLUMN_COLOR_LABELS[color] ?? color;
                    const isActive = board.settings.columnColors[column.title] === color;

                    colorMenu.addItem((colorItem) => {
                        const fragment = document.createDocumentFragment();
                        const dot = document.createElement("span");

                        dot.className = "kanban-menu__color-dot";
                        dot.style.background = color;

                        const text = document.createElement("span");

                        text.textContent = label;

                        fragment.appendChild(dot);
                        fragment.appendChild(text);

                        colorItem.setTitle(fragment);
                        if (isActive) colorItem.setChecked(true);
                        colorItem.onClick(() => {
                            const newColumnColors = { ...board.settings.columnColors, [column.title]: color };

                            onMutation({
                                ...board,
                                settings: { ...board.settings, columnColors: newColumnColors },
                            });
                        });
                    });
                }

                colorMenu.addSeparator();

                colorMenu.addItem((colorItem) =>
                    colorItem.setIcon("rotate-ccw").setTitle("Reset color").onClick(() => {
                        const newColumnColors = { ...board.settings.columnColors };

                        delete newColumnColors[column.title];

                        onMutation({
                            ...board,
                            settings: { ...board.settings, columnColors: newColumnColors },
                        });
                    }),
                );

                colorMenu.showAtMouseEvent(event as MouseEvent);
            }),
        );

        menu.addSeparator();

        menu.addItem((item) =>
            item
                .setIcon("trash-2")
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

function createCardSortableOptions(onEnd: (event: SortableEvent) => void, group?: string): Sortable.Options {
    return {
        group: group ?? "kanban-cards",
        handle: ".kanban-card__drag-handle",
        animation: 150,
        forceFallback: true,
        fallbackOnBody: true,
        fallbackClass: "kanban-card--dragging",
        ghostClass: "kanban-card--ghost",
        dragClass: "kanban-card--drag",
        onEnd,
    };
}

function createColumnCardMoveHandler(board: Board, onMutation: MutationHandler): (event: SortableEvent) => void {
    return (event: SortableEvent) => {
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
    };
}

function getDateForSection(dateKey: string): string | null {
    if (dateKey === "today") return toDateString(new Date());
    if (dateKey === "overdue") return null;

    return dateKey;
}

function renderTodayView(
    container: HTMLElement,
    board: Board,
    viewState: ViewState,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
): Sortable[] {
    const dateGroups = collectCardsByDateGroup(board);
    const todayPanel = document.createElement("div");

    todayPanel.className = "kanban-today";

    const sortableInstances: Sortable[] = [];
    const sectionCardLists: { dateKey: string; element: HTMLElement }[] = [];

    for (const group of dateGroups) {
        const section = document.createElement("div");

        section.className = "kanban-today__section";
        if (group.dateKey === "overdue") section.classList.add("kanban-today__section--overdue");

        const header = document.createElement("div");

        header.className = "kanban-today__header";

        const title = document.createElement("div");

        title.className = "kanban-today__title";
        if (group.dateKey === "overdue") title.classList.add("kanban-today__title--overdue");
        title.textContent = group.label;

        const count = document.createElement("span");

        count.className = "kanban-today__count";
        count.textContent = String(group.cards.length);

        header.appendChild(title);
        header.appendChild(count);
        section.appendChild(header);

        const cardListElement = document.createElement("div");

        cardListElement.className = "kanban-today__cards";
        cardListElement.dataset.dateKey = group.dateKey;

        for (const todayCard of group.cards) {
            const pill = {
                title: todayCard.columnTitle,
                color: getColumnColor(todayCard.columnTitle, todayCard.columnIndex, board),
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

        section.appendChild(cardListElement);
        todayPanel.appendChild(section);
        sectionCardLists.push({ dateKey: group.dateKey, element: cardListElement });
    }

    const layout = document.createElement("div");

    layout.className = "kanban-today-layout";
    layout.appendChild(todayPanel);

    const columnsPanel = document.createElement("div");

    columnsPanel.className = "kanban-today-layout__columns";

    for (let columnIndex = 0; columnIndex < board.columns.length; columnIndex++) {
        const column = board.columns[columnIndex];
        const columnElement = createColumnElement(column, columnIndex, board, viewState, onMutation, vault, pluginSettings);

        columnsPanel.appendChild(columnElement);
    }

    layout.appendChild(columnsPanel);
    container.appendChild(layout);

    for (const { dateKey, element: cardListElement } of sectionCardLists) {
        const sectionSortable = Sortable.create(cardListElement, createCardSortableOptions((event: SortableEvent) => {
            const targetDateKey = (event.to as HTMLElement).dataset.dateKey;
            const sourceDateKey = (event.from as HTMLElement).dataset.dateKey;
            const cardId = (event.item as HTMLElement).dataset.cardId;
            const movedCardIndex = Number((event.item as HTMLElement).dataset.cardIndex);
            const movedColumnIndex = Number((event.item as HTMLElement).dataset.columnIndex);

            if (cardId && targetDateKey && sourceDateKey !== targetDateKey) {
                const targetDate = getDateForSection(targetDateKey);
                const card = board.columns[movedColumnIndex].cards[movedCardIndex];

                if (targetDate) {
                    const newColumns = immutableUpdateCard(board.columns, movedColumnIndex, movedCardIndex, {
                        date: targetDate,
                    });

                    const newTodayOrder = { ...board.settings.todayOrder };

                    for (const listItem of sectionCardLists) {
                        const cardElements = listItem.element.querySelectorAll<HTMLElement>(".kanban-card");
                        const orderIds: string[] = [];

                        cardElements.forEach((element) => {
                            const elementCardId = element.dataset.cardId;

                            if (elementCardId) orderIds.push(elementCardId);
                        });

                        if (orderIds.length > 0) {
                            newTodayOrder[listItem.dateKey] = orderIds;
                        } else {
                            delete newTodayOrder[listItem.dateKey];
                        }
                    }

                    onMutation({
                        ...board,
                        columns: newColumns,
                        settings: { ...board.settings, todayOrder: newTodayOrder },
                    });

                    return;
                } else if (targetDateKey === "overdue" && card.date) {
                    // already has an overdue date; keep it
                }
            }

            const newTodayOrder = { ...board.settings.todayOrder };

            for (const listItem of sectionCardLists) {
                const cardElements = listItem.element.querySelectorAll<HTMLElement>(".kanban-card");
                const orderIds: string[] = [];

                cardElements.forEach((element) => {
                    const elementCardId = element.dataset.cardId;

                    if (elementCardId) orderIds.push(elementCardId);
                });

                if (orderIds.length > 0) {
                    newTodayOrder[listItem.dateKey] = orderIds;
                } else {
                    delete newTodayOrder[listItem.dateKey];
                }
            }

            onMutation({
                ...board,
                settings: { ...board.settings, todayOrder: newTodayOrder },
            });
        }, "kanban-today-cards"));

        sortableInstances.push(sectionSortable);
    }

    const cardLists = columnsPanel.querySelectorAll<HTMLElement>(".kanban-column__cards");

    cardLists.forEach((cardList) => {
        const instance = Sortable.create(cardList, createCardSortableOptions(createColumnCardMoveHandler(board, onMutation)));

        sortableInstances.push(instance);
    });

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
        const instance = Sortable.create(cardList, createCardSortableOptions(createColumnCardMoveHandler(board, onMutation)));

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

    const previousTodayList = container.querySelector(".kanban-today");
    const savedTodayScroll = previousTodayList ? previousTodayList.scrollTop : 0;

    const previousColumnsPanel = container.querySelector(".kanban-today-layout__columns");
    const savedColumnsPanelScroll = previousColumnsPanel ? previousColumnsPanel.scrollTop : 0;

    container.empty();

    if (viewState.hideCompletedActive) {
        container.dataset.hideCompleted = "true";
    } else {
        delete container.dataset.hideCompleted;
    }

    const toolbar = createToolbar(viewState, onViewStateChange, app);

    container.appendChild(toolbar);

    if (viewState.todayFilterActive) {
        const sortableInstances = renderTodayView(container, board, viewState, onMutation, vault, pluginSettings);
        const newTodayList = container.querySelector(".kanban-today");
        const newColumnsPanel = container.querySelector(".kanban-today-layout__columns");

        if (newTodayList) newTodayList.scrollTop = savedTodayScroll;
        if (newColumnsPanel) newColumnsPanel.scrollTop = savedColumnsPanelScroll;

        return sortableInstances;
    }

    const sortableInstances = renderBoardColumns(container, board, viewState, onMutation, vault, pluginSettings);
    const newBoard = container.querySelector(".kanban-board");

    if (newBoard) newBoard.scrollLeft = savedScrollLeft;

    return sortableInstances;
}
