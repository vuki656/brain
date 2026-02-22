import Sortable, { SortableEvent } from "sortablejs";
import { Menu, Notice, TFile, Vault } from "obsidian";

import { Board, Card, Column, Priority, ViewState, PluginSettings } from "./types";

type MutationHandler = (board: Board) => void;

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

function createCardElement(
    card: Card,
    columnIndex: number,
    cardIndex: number,
    board: Board,
    onMutation: MutationHandler,
    vault: Vault,
    pluginSettings: PluginSettings,
): HTMLElement {
    const cardElement = document.createElement("div");

    cardElement.className = "kanban-card";
    cardElement.dataset.columnIndex = String(columnIndex);
    cardElement.dataset.cardIndex = String(cardIndex);

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

    const priorityButton = document.createElement("button");

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

    menu.addItem((item) =>
        item.setTitle("Urgent").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: "urgent" });
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
    menu.addItem((item) =>
        item.setTitle("Priority: Urgent").onClick(() => {
            const newColumns = immutableUpdateCard(board.columns, columnIndex, cardIndex, { priority: "urgent" });
            onMutation({ ...board, columns: newColumns });
        }),
    );

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
    if (isCollapsed) columnElement.classList.add("kanban-column--collapsed");

    const header = document.createElement("div");

    header.className = "kanban-column__header";

    const titleElement = document.createElement("h3");

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

    const visibleCardCount = viewState.todayFilterActive
        ? column.cards.filter(isCardVisibleInTodayFilter).length
        : viewState.hideCompletedActive
          ? column.cards.filter((card) => !card.completed).length
          : column.cards.length;

    const countBadge = document.createElement("span");

    countBadge.className = "kanban-column__count";
    countBadge.textContent = String(visibleCardCount);

    const collapseButton = document.createElement("button");

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

        const cardsToRender = viewState.todayFilterActive ? column.cards.filter(isCardVisibleInTodayFilter) : column.cards;

        for (let cardIndex = 0; cardIndex < cardsToRender.length; cardIndex++) {
            const card = cardsToRender[cardIndex];
            const realCardIndex = viewState.todayFilterActive ? column.cards.indexOf(card) : cardIndex;

            cardList.appendChild(createCardElement(card, columnIndex, realCardIndex, board, onMutation, vault, pluginSettings));
        }

        columnElement.appendChild(cardList);

        if (!viewState.todayFilterActive) {
            columnElement.appendChild(createAddCardForm(columnIndex, board, onMutation));
        }
    }

    return columnElement;
}

function createToolbar(viewState: ViewState, onViewStateChange: (viewState: ViewState) => void): HTMLElement {
    const toolbar = document.createElement("div");

    toolbar.className = "kanban-toolbar";

    const todayButton = document.createElement("button");

    todayButton.className = "kanban-toolbar__button";
    if (viewState.todayFilterActive) todayButton.classList.add("kanban-toolbar__button--active");
    todayButton.textContent = "Today";
    todayButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, todayFilterActive: !viewState.todayFilterActive });
    });

    const hideCompletedButton = document.createElement("button");

    hideCompletedButton.className = "kanban-toolbar__button";
    if (viewState.hideCompletedActive) hideCompletedButton.classList.add("kanban-toolbar__button--active");
    hideCompletedButton.textContent = "Hide completed";
    hideCompletedButton.addEventListener("click", () => {
        onViewStateChange({ ...viewState, hideCompletedActive: !viewState.hideCompletedActive });
    });

    toolbar.appendChild(todayButton);
    toolbar.appendChild(hideCompletedButton);

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

export function renderBoard(
    container: HTMLElement,
    board: Board,
    viewState: ViewState,
    onMutation: MutationHandler,
    onViewStateChange: (viewState: ViewState) => void,
    vault: Vault,
    pluginSettings: PluginSettings,
): Sortable[] {
    container.empty();

    if (viewState.hideCompletedActive) {
        container.dataset.hideCompleted = "true";
    } else {
        delete container.dataset.hideCompleted;
    }

    const toolbar = createToolbar(viewState, onViewStateChange);

    container.appendChild(toolbar);

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
    const cardLists = boardElement.querySelectorAll<HTMLElement>(".kanban-column__cards");

    cardLists.forEach((cardList) => {
        const instance = Sortable.create(cardList, {
            group: "kanban-cards",
            animation: 150,
            forceFallback: true,
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
