import { Plugin } from 'obsidian';
import { Generator } from '@types/core-js';

import { Table } from "./src/table";
import { Column } from "./src/column";

export default class TableSort extends Plugin {

	storage: Table[] = [];
	gen: Generator;

	* autoIncrement() {
		let index = 0;
		while (true) {
			yield index++;
		}
	}

	private getTableElement(th: HTMLElement): HTMLTableElement | undefined {
		return th.closest("table") || undefined;
	}

	private getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id")?.replace("table-", "");
		return (id) ? parseInt(id) : this.gen.next().value;
	}

	private hasCustomClasses(table: HTMLElement): boolean {
		const classes = table.getAttribute("class") || "";
		if (classes.length > 0) {
			return true;
		}
		return false;
	}

	private isNewTable(id: number): boolean {
		//  Return true if the user has selected a new table
		return (this.storage.length - 1 >= id) ? false : true;
	}

	async onload() {
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.gen = this.autoIncrement();
		this.storage = [];
		
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			if (evt.target == null) {
				return;
			}
			const element: HTMLElement = evt.target as HTMLElement;

			if (element.tagName !== "TH") {
				return;
			}

			evt.preventDefault();

			const tableElement: HTMLTableElement | undefined = this.getTableElement(element);
			if (!tableElement || this.hasCustomClasses(tableElement)) {
				return;
			}

			const tableID: number = this.getTableID(tableElement);

			let table;
			if (this.isNewTable(tableID)) {
				table = new Table(tableID, tableElement);
				this.storage.push(table);
			} else {
				table = this.storage[tableID];
			}

			const columnIndex = table.getColumnIndex(element);
			const column: Column = table.getColumnDataAt(columnIndex);

			table.handleClick(column, evt.ctrlKey == true);
			table.sort();
		}, { capture: true });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
}
