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

	// addClickedElement(columnIndex: number): void {
	// 	if (this.filters.includes(columnIndex)) {
	// 		return;
	// 	}
	// 	this.filters = [...this.filters, columnIndex];
	// }

	updateSortingOrder(column: Column, isPressingCtrl: boolean): void {
		// sets the order for the column selection
		const isNewFilter = !this.filters.includes(column);
		
		if (!isNewFilter && column.order == "neutral") {
			this.filters.splice(column.id, 1);
		}
		if (!isPressingCtrl) {
			// reset other columns and update self
			this.columns.forEach((e) => {
				if (e !== column) {
					e.order = "neutral";
					e.setIcon();
				}
			});
		}
		if (isNewFilter && !isPressingCtrl) {
			column.order = "descending";
			this.filters = [column];
		}
		if (isNewFilter && isPressingCtrl) {
			this.filters.push(column);
		}
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
		console.log(id, element, this.getTableHeads());
		if (!this.columns[id]) {
			const column = new Column(id, element, "neutral");
			this.columns[id] = column;
			return column;
		}
		
		return this.columns[id];
	}

	getColumnIndex(th: HTMLElement) {
		this.updateElement();
		return Array.prototype?.indexOf.call(this.getTableHeads(), th);
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

	// setActiveColumn(clickedColumn = this.filters.length - 1): void {
	// 	/*   Activates the clicked column and sets the sorting mode accordingly.   */
	// 	const column = this.getColumnDataAt(clickedColumn);
	// 	if (this.filters.length > 1) {
	// 		// 
	// 	} else if (this.column !== clickedColumn) {
	// 		this.sorting = "neutral";
	// 	}
	// 	this.column = clickedColumn;
	// 	// column.update();
	// }

	// setClickedElement(column: number): void {
	// 	this.filters = [column];
	// }

	updateElement() {
		const element = document.getElementById(this.id.toString()) as HTMLElement;
		if (!element) {
			console.error("Found no registered table with the corresponding id.");
		}
	}

	// updateIcons() {
	//     // Sets CSS classes or each of the TH elements
	// 	this.getTableHeads().forEach((thead, index) => {
	// 		thead.classList.remove("neutral");
	// 		thead.classList.remove("ascending");
	// 		thead.classList.remove("descending");

	// 		if (this.column === index) {
	// 			thead.classList.add(this.sorting);
	// 		} else {
	// 			thead.classList.add("neutral");
	// 		}
	// 	});
	// }

	// updateSortingMode(columnID: number): string {
	// 	if (this.column !== columnID || this.sorting === "neutral") {
	// 		this.sorting = "descending";
	// 	} else if (this.sorting === "ascending") {
	// 		this.sorting = "neutral";
	// 	} else {
	// 		this.sorting = "ascending";
	// 	}
	// 	return this.sorting;
	// }
}
