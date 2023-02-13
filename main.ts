import {
	Plugin
} from 'obsidian';



export default class TableSort extends Plugin {
	static Tables = class {
		id: number;
		column: number;
		element: HTMLElement;
		theads: HTMLElement[];
		currentOrder: HTMLElement[];
		originalOrder: HTMLElement[];
		sorting: string;
	
		constructor(id: number, element: HTMLTableElement) {
			this.id = id || 0;
			this.column = -1;
			this.element = element;
			this.element.setAttribute("id", id.toString());

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

		getColumnIndex(th: HTMLElement) {
			return Array.prototype?.indexOf.call(this.theads, th);
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
			let newOrder: HTMLElement[];
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

		setActiveColumn(index: number): void {
			if (this.column !== index) {
				this.sorting = "neutral";
			}
			this.column = index;
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

		updateSortingMode(columnID: number): string {
			if (this.column !== columnID || this.sorting === "neutral") {
				this.sorting = "descending";
			}
			else if (this.sorting === "ascending") {
				this.sorting = "neutral";
			}
			else {
				this.sorting = "ascending";
			}
			return this.sorting;
		}
	}

	storage: any[] = [];

	*auto_increment() {
		let index = 0;
		while (true) {
			yield index++;
		}
	}

	configuration = {
		defaultID: 0,		// automatically incrementing
		lastTable: -1,
		lastColumn: -1,
		sortMode: "neutral"
	};

	private getTableElement(th: HTMLElement): HTMLTableElement | undefined {
		return th.closest("table") || undefined;
	}

	private getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id")?.replace("table-", "");
		return (id) ? parseInt(id) : this.configuration.defaultID++;
	}

	private isNewTable(id: number): boolean {
		//  Return true if the user has selected a new table
		return (this.storage.length-1 >= id) ? false: true;
	}

	async onload() {
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			if (evt.target == null) { return; }
			const element: HTMLElement = evt.target;

			if (element.tagName !== "TH") {
				return;
			}
			
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

			const columnIndex = table.getColumnIndex(element);
			table.setActiveColumn(columnIndex);
			table.updateSortingMode(columnIndex);
			table.updateIcons();
			table.sort(tableElement, element);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
}
