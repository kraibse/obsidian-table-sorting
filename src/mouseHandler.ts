import TableSort from "../main";
import { Table } from "./table";
import { Column } from "./column";
import { getMenuElement, ContextMenu, ContextMenuInterface } from "./menuHandler";
import { SORT_SELECTED } from "./icons";

import { Notice } from "obsidian";


export function getMousedownHandler(plugin: TableSort) {
	return async (evt: MouseEvent) => {
		if (evt.target == null) {
			return;
		}

		const element: HTMLElement = evt.target as HTMLElement;

		TableSort.log("Clicked element: ", element);

		const tableElement: HTMLTableElement | undefined = plugin.getTableElement(element);

		TableSort.log("Table element: ", tableElement);

		const isNoPluginTable: boolean = (!plugin.hasCustomClasses(tableElement as HTMLElement)) && plugin.getViewMode() === "source";

		TableSort.log("isNoPluginTable: ", isNoPluginTable);

		// TableSort.log("Has clicked element: ", hasClickedTable(tableElement as HTMLElement));


		if (!tableElement) {
			return;
		}

		if (!tableElement || isNoPluginTable) {
			return;
		}
		
		const openedMenu: unknown  = await getMenuElement(evt, plugin);
		TableSort.log("Opened menu: ", openedMenu);

		if (!openedMenu) {
			return;
		}

	
		// evt.preventDefault()

		const tableID: number = plugin.getTableID(tableElement);

		let table;
		if (plugin.isNewTable(tableID)) {
			table = new Table(tableID, tableElement, plugin);
			plugin.storage.push(table);
			TableSort.log("New table: ", tableID);
		} else {
			table = plugin.storage[tableID];
		}
		
		new Notice(`Clicked table #${tableID}.`);

		const columnIndex = table.getColumnIndex(element);
		const column: Column = table.getColumn(columnIndex);

		TableSort.log(columnIndex, column);

		// table.sort();
		
		const menu: ContextMenuInterface = new ContextMenu(openedMenu as Element, plugin);
		menu.addSeparator();
		menu.addSectionHeader("Table Sorting - Temporary Sorting", "center");
		menu.addAction(() => {

			// TODO: Figure out where to place handleClick and when to select column

			table.handleClick(column);
			column.order = "ascending";
			table.sort();
			table.updateColumns();
		}, "Sort temporarily by column (A to Z)", "table-sort");

        menu.addAction(() => {
			table.handleClick(column);
			column.order = "descending";
			table.sort();
			table.updateColumns();
		}, "Sort temporarily by column (Z to A)", "table-sort");


		const isSelected = column.isSelected;
		menu.addAction(() => {
			if (isSelected) {
				column.deselect();
				table.removeFilter(column);
			}
			else {
				column.select();
				if (!table.containsColumn(column)) {
					table.filters.push(column);
				}
			}
			table.updateColumns();
		},
		(isSelected) ? "Deselect" : "Select", "table-sort");

		menu.addAction(() => {
			table.reset();
		}, "Reset filters", "table-sort");
	}
}


function addActionToMenu(menu: HTMLDivElement, action: Function, title: string, dataSection?: string) {
	const menuItemHTML = `
			<div class="menu-item-icon">
				${SORT_SELECTED}
			</div>
			<div class="menu-item-title">${title}</div>
	`;

	const menuItem = document.createElement("div");
	menuItem.classList.add("menu-item");
	menuItem.setAttribute("data-section", dataSection || "");

	menuItem.innerHTML = menuItemHTML;

	menuItem.addEventListener("click", () => { action(); });

	menuItem.addEventListener("mouseenter", () => {
		menuItem.parentElement?.querySelector(".selected")?.classList.remove("selected");
		menuItem.classList.add("selected");
	});

	menuItem.addEventListener("mouseleave", () => {
		menuItem.classList.remove("selected");
	});

	menu.appendChild(menuItem);
}


function hasClickedTable(element: HTMLElement) {

	const parent = element.closest(".table-editor");
	if (!parent) return false;

	return true;
}

