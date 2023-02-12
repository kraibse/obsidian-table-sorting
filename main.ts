import {
	Plugin
} from 'obsidian';



export default class TableSort extends Plugin {
	static Tables = class {
		id: number;
		column: number;
		theads: HTMLElement[];
		currentOrder: HTMLElement[];
		originalOrder: HTMLElement[];
		sorting: string;
	
		constructor(id: number, element: HTMLTableElement) {
			this.id = id || 0;
			this.column = -1;
			this.theads = this.getTableHeads(element);
			this.currentOrder = this.getTableRows(element);
			this.originalOrder = this.currentOrder;
			this.sorting = "neutral";
		}

		fillTable(table: HTMLElement, rows: HTMLElement[]): void {
			rows.forEach((row) => {
				table.querySelector("tbody")?.appendChild(row);
			});
		}

		getActiveColumn() {
			return this.column;
		}

		getTableHeads(table: HTMLElement): HTMLElement[] {
			return Array.from(table.querySelectorAll("th"));
		}

		getTableRows(table: HTMLElement): HTMLElement[] {
			const rowElements = table.querySelectorAll("tr");
			return Array.from(rowElements).splice(1, rowElements.length);
		}

		removeRows(rows: HTMLElement[]): void {
			Array.from(rows).forEach((row) => {
				row.remove();
			});
		}
		
		setActiveColumn(element: HTMLElement): void {
			const index = Array.prototype.indexOf.call(this.theads, element);
			return index;
		}

		sort(table: HTMLElement, th: HTMLElement) {
			const sortColumnValue = (rowA: HTMLElement, rowB: HTMLElement) => {
				const cellA = rowA.children[this.column] as HTMLTableCellElement;
				const cellB = rowB.children[this.column] as HTMLTableCellElement;
	
				if (!cellA || !cellB) {
					return 0;
				}
	
				const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : false;
				const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : false;
	
				return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
			};
			if (this.sorting == "neutral") {
				this.currentOrder = this.originalOrder;
			}
			else {	
				this.currentOrder = Array.from(this.currentOrder).sort((rowA, rowB) => {
					const comparison = sortColumnValue(rowA, rowB);
					return (this.sorting === "ascending") ? -comparison : comparison;
				});
			}
	
			// this.removeRows();
			this.fillTable(table, this.currentOrder);
		}

		updateActiveColumn(index: number): number {
			return (this.column === index && this.sorting === "ascending") ? -1 : this.column;
		}

		updateIcons() {
			this.theads.forEach((thead, index) => {
				thead.classList.remove("neutral");
				thead.classList.remove("ascending");
				thead.classList.remove("descending");
	
				if (this.column === index) {
					thead.classList.add(this.sorting);
				} else {
					thead.classList.add("neutral");
				}
			});
		}

		updateSortingMode(columnID: number) {
			if (this.column !== columnID || this.sorting === "neutral") {
				this.sorting = "descending";
			}
			else if (this.sorting === "ascending") {
				this.sorting = "neutral";
			}
			else {
				this.sorting = "ascending";
			}
			console.log("Switching to sort mode -> " + this.sorting);
		}
	}

	storage: any[] = [];

	configuration = {
		defaultID: 0,		// automatically incrementing
		lastTable: -1,
		lastColumn: -1,
		sortMode: "neutral"
	};

	originalOrder: { [key: string]: HTMLElement[] } = { };
	sortModes: { [key: string]: string } = { };


	private getTableElement(th: HTMLElement): HTMLTableElement | undefined {
		return th.closest("table") || undefined;
	}

	private getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id")?.replace("table-", "");
		return (id) ? parseInt(id) : this.configuration.defaultID++;
	}

	// private getColumnIndex(thead: NodeListOf < HTMLElement > , th: HTMLElement): number {
	// 	const columnID = Array.prototype.indexOf.call(thead, th);
	// 	const lastColumn = this.configuration.lastColumn;
	// 	if (lastColumn == columnID && this.sortModes[columnID] == "ascending") {	// reset to neutral
	// 		return -1;
	// 	}
	// 	return columnID;
	// }

	private isNewTable(id: number): boolean {
		//  Return true if the user has selected a new table
		return (this.storage.length >= id) ? false: true;
	}

	// private loadConfig(id: string) {		
	// 	if (this.configuration.lastTable === id && this.configuration.lastColumn != -1) {
	// 		this.sortModes[id] = "descending";
	// 	}
	// 	this.configuration.lastTable = id;
	// 	this.configuration.lastColumn = -1;
	// 	this.sortModes.columnID = this.sortModes[id];
	// }

	async onload() {
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		
		this.originalOrder = {};
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			if (evt.target == null) { return; }
			const element: HTMLElement = evt.target;

			if (element.tagName === "TH") {
				evt.preventDefault();
				
				const tableElement: HTMLTableElement | undefined = this.getTableElement(element);
				if (!tableElement) {
					return;
				}

				const tableID: number = this.getTableID(tableElement);

				let table;
				if (this.isNewTable(tableID)) {
					table = new TableSort.Tables(tableID, tableElement);
					this.storage.push(table);
				}
				else {
					table = this.storage[tableID];
				}

				const columnID: number = table.updateActiveColumn(table.setActiveColumn(element));

				table.updateSortingMode(columnID);
				table.updateIcons();
				table.sort(tableElement, element);
			}
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	// saveConfig(table: HTMLElement) {
	// 	const tableID = table.getAttribute("id")?.replace("table-", "") || -1;
	// 	if (!tableID || tableID in this.originalOrder) {
	// 		return;
	// 	}
	// 	const tr: HTMLElement[] = this.getTableRows(table);
	// 	// const id: string = (this.configuration.defaultID++).toString();
	// 	table.setAttribute("id", "table-" + id);
	// 	this.originalOrder[id] = tr;
	// 	this.sortModes[id] = "descending";
	// }

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
