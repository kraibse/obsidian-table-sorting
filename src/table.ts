import {
	Column
} from "./column";

export class Table {
	id: number;
	column: number;
	filters: Column[];
	element: HTMLElement;
	currentOrder: HTMLElement[];
	originalOrder: HTMLElement[];

	columns: Column[] = [];

	constructor(id: number, element: HTMLTableElement) {
		this.id = id || 0;
		this.element = element;
		this.column = -1;
		this.filters = [];
		element.setAttribute("id", id.toString());
		this.currentOrder = this.getTableRows();
		this.originalOrder = this.currentOrder;
	}

	updateSortingOrder(column: Column, isPressingCtrl: boolean): void {
		// sets the order for the column selection
		if (!isPressingCtrl) {
			this.filters = [column];
			this.columns.forEach((e) => {
				if (e !== column) {
					e.order = "neutral";
					e.setLabel("");
				}
				else {
					// e.order = (e.order != "") ? "descending": "neutral";
				}
			});
		}
		else {
			column.update();	
		}

		const isRegistered = this.filters.includes(column);
		const theLastColumn: number = this.filters.indexOf(column);
		
		// if (isPressingCtrl && isRegistered) {
		// }
		
		if (isPressingCtrl && !isRegistered && column.order == "neutral") {
			column.update();
			this.filters.push(column);
		}
		else if (!isPressingCtrl && !isRegistered) {
			column.order = "descending";
			this.filters = [column];
		}

		if (column.order == "neutral") {	// TODO: WTF IS THIS WRONG ID
			this.filters.splice(theLastColumn, 1);
			column.setLabel("");
		}

		this.columns.forEach((e) => {
			e.setIcon();
			if (e.order == "neutral") {
				this.filters.splice(theLastColumn, 1);

			}

			if (e.order != "neutral") { return; }
			e.order = "neutral";
			e.setLabel("");
		});
		this.filters.forEach((e, i) => {
			e.setLabel("(" + i.toString() + ")");
			e.setIcon();
		});
	}

	fillTable(table: HTMLElement, rows: HTMLElement[]): void {
		rows.forEach((row) => {
			table.querySelector("tbody")?.appendChild(row);
		});
	}

	getColumnDataAt(id: number): Column {
		// if (id == -1) {
		// 	return new Column(id, element, "neutral");
		// }
		const element: HTMLElement = this.getTableHeads()[id];
		if (!this.columns[id]) {
			const column = new Column(id, element, "neutral");
			this.columns[id] = column;
			return column;
		}
		
		return this.columns[id];
	}

	getColumnIndex(th: HTMLElement) {
		this.updateElement();
		return Array.prototype.indexOf.call(this.getTableHeads(), th);
	}

	getTableHeads(): HTMLElement[] {
		this.updateElement();
		return Array.from(this.element?.querySelectorAll("th"));
	}

	getTableRows(): HTMLElement[] {
		this.updateElement()
		const rowElements = this.element.querySelectorAll("tr");
		return Array.from(rowElements).splice(1, rowElements.length);	// excluding thead row
	}

	removeRows(rows: HTMLElement[]): void {
		Array.from(rows).forEach((row) => {
			row.remove();
		});
	}

	sort(): void {
		console.log(this.filters);

		const compareRows = (rowA: HTMLElement, rowB: HTMLElement) => {
			for (const filter of this.filters) {

				const cellA = rowA.children[filter.id] as HTMLTableCellElement;
				const cellB = rowB.children[filter.id] as HTMLTableCellElement;

				if (!cellA || !cellB) {
					return 0;
				}

				const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : false;
				const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : false;

				if (valueA < valueB) {
					return -1 * filter.getWeight();
				}
				if (valueA > valueB) {
					return 1 * filter.getWeight();
				}
			}
			return 0;
		};

		if (this.filters.length == 0) {
			this.currentOrder = this.originalOrder;
		} else {
			// TODO: Enable sorting by column
			this.currentOrder = Array.from(this.currentOrder).sort((rowA, rowB) => {
				return compareRows(rowA, rowB);
			});
		}

		// this.removeRows();
		this.fillTable(this.element, this.currentOrder);
	}

	updateElement() {
		const element = document.getElementById(this.id.toString()) as HTMLElement;
		if (!element) {
			console.error("Found no registered table with the corresponding id.");
		}
	}
}
