import { Plugin } from 'obsidian';
import { Generator } from '@types/core-js';

import { Table } from "./src/table";
import { getMousedownHandler } from "./src/mouseHandler"

export default class TableSort extends Plugin {

	storage: Table[] = [];
	gen: Generator;

	* autoIncrement() {
		let index = 0;
		while (true) {
			yield index++;
		}
	}

	getTableElement(th: HTMLElement): HTMLTableElement | undefined {
		return th.closest("table") || undefined;
	}
	
	getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id") ?.replace("table-", "");
		return (id) ? parseInt(id) : this.gen.next().value;
	}
	
	hasCustomClasses(table: HTMLElement): boolean {
		const classes = table.getAttribute("class") || "";
		if (classes.length > 0) {
			return true;
		}
		return false;
	}
	
	isNewTable(id: number): boolean {
		//  Return true if the user has selected a new table
		return (this.storage.length - 1 >= id) ? false : true;
	}

	async onload() {
		this.gen = this.autoIncrement();
		this.storage = [];
		
		const mousedownHandler = getMousedownHandler(this);
		this.registerDomEvent(document, 'click', mousedownHandler, { capture: true });
	}

	onunload() {
		this.storage = [];
	}
}
