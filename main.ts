import {
	Plugin
} from 'obsidian';



export default class TableSort extends Plugin {
	static Tables = class {
		id: number;
		column: number;
		order: HTMLElement[];
		sortMode: string;
	
		constructor(id: number, order: HTMLElement[]) {
			this.order = order || [];
			this.id = id || 0;
			this.column = -1;
			this.sortMode = "descending";
		}
	}

	storage: [] = [];

	configuration = {
		defaultID: 0,		// automatically incrementing
		lastTable: -1,
		lastColumn: -1,
		sortMode: "neutral"
	};

	originalOrder: { [key: string]: HTMLElement[] } = { };
	sortModes: { [key: string]: string } = { };

	private removeRows(rows: HTMLElement[]): void {
		Array.from(rows).forEach((row) => {
			row.remove();
		});
	}

	private fillTable(table: HTMLElement, rows: HTMLElement[]): void {
		rows.forEach((row) => {
			table.querySelector("tbody")?.appendChild(row);
		});
	}

	private getTableElement(th: HTMLElement): HTMLTableElement | undefined {
		return th.closest("table") || undefined;
	}

	private getTableID(table: HTMLElement): string {
		return table.getAttribute("id")?.replace("table-", "") || "-1";
	}

	private getTableHeads(table: HTMLElement): NodeListOf < HTMLTableCellElement > {
		return table.querySelectorAll("th");
	}

	private getTableRows(table: HTMLElement): HTMLElement[] {
		const rowElements = table.querySelectorAll("tr");
		return Array.from(rowElements).splice(1, rowElements.length);
	}

	private getColumnIndex(thead: NodeListOf < HTMLElement > , th: HTMLElement): number {
		const columnID = Array.prototype.indexOf.call(thead, th);
		const lastColumn = this.configuration.lastColumn;
		if (lastColumn == columnID && this.sortModes[columnID] == "ascending") {	// reset to neutral
			return -1;
		}
		return columnID;
	}

	private isNewTable(newID: number): boolean {
		//  Return true if the user has selected a new table
		const oldID = this.configuration.lastTable;
		if (oldID === newID) {
			return false;
		}
		return true;
	}

	private loadConfig(id: string) {		
		if (this.configuration.lastTable === id && this.configuration.lastColumn != -1) {
			this.sortModes[id] = "descending";
		}
		this.configuration.lastTable = id;
		this.configuration.lastColumn = -1;
		this.sortModes.columnID = this.sortModes[id];
	}

	async onload() {
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		
		this.originalOrder = {};
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			if (evt.target == null) { return; }
			const element: HTMLElement = evt.target;

			if (element.tagName === "TH") {
				evt.preventDefault();
				const table: HTMLTableElement | undefined = this.getTableElement(element);
				if (!table) {
					return;
				}
			
				const tableID = this.getTableID(table);
				const isNewTable = this.isNewTable(tableID);

				if (tableID in this.originalOrder) {
					this.loadConfig(tableID);
				} else {
					this.saveConfig(table);
				}
				
				this.sortTable(table, element);
			}
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	saveConfig(table: HTMLElement) {
		const tableID = table.getAttribute("id")?.replace("table-", "") || -1;
		if (!tableID || tableID in this.originalOrder) {
			return;
		}
		const tr: HTMLElement[] = this.getTableRows(table);
		const id: string = (this.configuration.defaultID++).toString();
		table.setAttribute("id", "table-" + id);
		this.originalOrder[id] = tr;
		this.sortModes[id] = "descending";
	}

	sortTable(table: HTMLElement, th: HTMLElement) {
		const theads = this.getTableHeads(table);
		const rows = this.getTableRows(table);
		const columnID: number = this.getColumnIndex(theads, th);

		this.updateSortingMode(columnID);
		this.updateIcons(theads, columnID);

		const sortColumnValue = (rowA: HTMLElement, rowB: HTMLElement) => {
			const cellA = rowA.children[columnID] as HTMLTableCellElement;
			const cellB = rowB.children[columnID] as HTMLTableCellElement;

			if (!cellA || !cellB) {
				return 0;
			}

			const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : false;
			const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : false;

			return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
		};

		let order: HTMLElement[];

		if (this.sortModes[columnID] == "neutral") {
			const tableID = this.getTableID(table);
			order = this.originalOrder[tableID];
		}
		else {	
			order = Array.from(rows).sort((rowA, rowB) => {
				const comparison = sortColumnValue(rowA, rowB);
				return (this.sortModes[columnID] === "ascending") ? -comparison : comparison;
			});
		}

		this.removeRows(rows);
		this.fillTable(table, order);
	}

	updateIcons(theads: NodeListOf < HTMLTableCellElement > , columnID: number) {
		theads.forEach((thead, index) => {
			thead.classList.remove("neutral");
			thead.classList.remove("ascending");
			thead.classList.remove("descending");

			if (columnID === index) {
				thead.classList.add(this.sortModes[columnID]);
			} else {
				thead.classList.add("neutral");
			}
		});
	}

	updateSortingMode(columnID: number) {
		let mode: string;
		if (this.sortModes[columnID] === "ascending") {
			mode = "neutral";
		}
		else if (this.sortModes[columnID] === "descending") {
			mode = "ascending";
		}
		else {
			mode = "descending";
		}
		this.sortModes[columnID] = mode;
		console.log("Switching to sort mode -> " + mode);
		
	}

	onunload() {

	}

	needsDarkTheme() {
		// color will be "rgb(#, #, #)" or "rgba(#, #, #, #)"
		const color = window.getComputedStyle(document.body).backgroundColor;
		console.log("BG COLOR:", color);

		const rgb = (color || "")
			.replace(/\s/g, "")
			.match(/^rgba?\((\d+),(\d+),(\d+)/i);
		if (rgb) {
			// remove "rgb.." part from match & parse
			const colors = rgb.slice(1).map(Number);
			// http://stackoverflow.com/a/15794784/145346
			const brightest = Math.max(...colors);
			// return true if we have a dark background
			return brightest < 128;
		}
		// fallback to bright background
		return false;
	}
}
