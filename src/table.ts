import { Column } from "./column";

export class Table {
	id: number;
	column: number;
	clickedElements: number[];
	element: HTMLElement;
	theads: HTMLElement[];
	currentOrder: HTMLElement[];
	originalOrder: HTMLElement[];
	sorting: string;

    columns: Column[] = [];

	constructor(id: number, element: HTMLTableElement) {
		this.id = id || 0;
		this.column = -1;
		this.clickedElements = [];
		this.element = element;
		this.element.setAttribute("id", id.toString());

		this.theads = this.getTableHeads(element);
		this.currentOrder = this.getTableRows(element);
		this.originalOrder = this.currentOrder;
		this.sorting = "neutral";
	}

	addClickedElement(column: number): void {
		this.clickedElements = this.clickedElements.includes(this.column)
		? this.clickedElements : [...this.clickedElements, column];
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

	sort(): void {
		console.log(this.clickedElements);
		
		const sortColumnValue = (rowA: HTMLElement, rowB: HTMLElement) => {
			for (const columnIndex of this.clickedElements) {
				
				const cellA = rowA.children[columnIndex] as HTMLTableCellElement;
				const cellB = rowB.children[columnIndex] as HTMLTableCellElement;
				
				if (!cellA || !cellB) {
					return 0;
				}
				
				const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : false;
				const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : false;
				
				if (valueA < valueB) {
					return -1;
				}
				if (valueA > valueB) {
					return 1;
				}
			}
			return 0;
		};
		if (this.sorting == "neutral") {
			this.currentOrder = this.originalOrder;
		} else {
			// TODO: Enable sorting by column
			this.currentOrder = Array.from(this.currentOrder).sort((rowA, rowB) => {
				const comparison = sortColumnValue(rowA, rowB);
				return (this.sorting === "ascending") ? -comparison : comparison;
			});
		}

		// this.removeRows();
		this.fillTable(this.element, this.currentOrder);
	}

	setActiveColumn(index: number): void {
		if (this.column !== index) {
			this.sorting = "neutral";
		}
		this.column = index;
	}

	setClickedElement(column: number): void {
		this.clickedElements = [column];
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
		} else if (this.sorting === "ascending") {
			this.sorting = "neutral";
		} else {
			this.sorting = "ascending";
		}
		return this.sorting;
	}
}