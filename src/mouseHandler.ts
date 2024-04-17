import TableSort from "../main";
import { Table } from "./table";
import { Column } from "./column";
import { getMenuElement, ContextMenu, ContextMenuInterface } from "./menuHandler";



export function getMousedownHandler(plugin: TableSort) {
	return async (evt: MouseEvent) => {
		if (evt.target == null) {
			return;
		}

		const element: HTMLElement = evt.target as HTMLElement;

		const tableElement: HTMLTableElement | undefined = plugin.getTableElement(element);
		if (!tableElement) {
			return;
		}

		if (!tableElement || !plugin.hasCustomClasses(tableElement) || !hasClickedTable(tableElement)) {
			return;
		}
		
		const openedMenu: unknown  = await getMenuElement();
		if (!openedMenu) {
			return;
		}

	
		// evt.preventDefault()

		const tableID: number = plugin.getTableID(tableElement);

		let table;
		if (plugin.isNewTable(tableID)) {
			table = new Table(tableID, tableElement, plugin);
			plugin.storage.push(table);
			console.log("New table: ", tableID);
		} else {
			table = plugin.storage[tableID];
		}
		
		new Notice(`Clicked table #${tableID}.`);

		const columnIndex = table.getColumnIndex(element);
		const column: Column = table.getColumnDataAt(columnIndex);

		console.log(columnIndex, column);

		// table.sort();
		
		const menu: ContextMenuInterface = new ContextMenu(openedMenu as Element, plugin);
		menu.addSeparator();
		menu.addSectionHeader("Plugin - Table Sorting", "center");
		menu.addAction(() => {

			// TODO: Figure out where to place handleClick and when to select column
			// also, find a way to select TH elements too

			column.order = "ascending";	
			table.filters = [column];
			table.sort();
			table.handleClick(column, evt.ctrlKey == true);
		}, "Sort temporarily by column (A to Z)", "table-sort");
        menu.addAction(() => {
			column.order = "descending";
			table.filters = [column];
			table.sort();
			table.handleClick(column, evt.ctrlKey == true);
		}, "Sort temporarily by column (Z to A)", "table-sort");
        menu.addAction(() => {
			column.order = "neutral";
			table.filters = [];
			table.sort();
			table.handleClick(column, evt.ctrlKey == true);
		}, "Reset filters", "table-sort");


		if (table.filters.length > 0) {
			menu.addSectionHeader(`Sorting by - ${column.getName()} ${column.order}`, "center");
		}
	}
}


function addActionToMenu(menu: HTMLDivElement, action: Function, title: string, dataSection?: string) {
	const menuItemHTML = `
			<div class="menu-item-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-arrow-up-az">
					<path d="m3 8 4-4 4 4"></path>
					<path d="M7 4v16"></path>
					<path d="M20 8h-5"></path>
					<path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"></path>
					<path d="M15 14h5l-5 6h5"></path>
				</svg>
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

