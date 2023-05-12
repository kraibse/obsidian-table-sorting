import TableSort from "../main";
import { Table } from "./table";
import { Column } from "./column";


export function getMousedownHandler(plugin: TableSort) {
	return async (evt: MouseEvent) => {

		if (evt.target == null) {
			return;
		}
		const element: HTMLElement = evt.target as HTMLElement;
		if (element.tagName !== "TH") {
			return;
		}
		const tableElement: HTMLTableElement | undefined = plugin.getTableElement(element);
		if (!tableElement || plugin.hasCustomClasses(tableElement)) {
			return;
		}

		evt.preventDefault();

		const tableID: number = plugin.getTableID(tableElement);

		let table;
		if (plugin.isNewTable(tableID)) {
			table = new Table(tableID, tableElement, plugin);
			plugin.storage.push(table);
		} else {
			table = plugin.storage[tableID];
		}

		const columnIndex = table.getColumnIndex(element);
		const column: Column = table.getColumnDataAt(columnIndex);

		table.handleClick(column, evt.ctrlKey == true);
		table.sort();
	}
}
