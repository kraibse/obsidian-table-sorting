import { Column } from "./column";

export class Table {
	id: number;
	column: number;
	clickedElements: number[];
	element: HTMLElement;
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
		this.currentOrder = this.getTableRows(element);
		this.originalOrder = this.currentOrder;
		this.sorting = "neutral";
	}

	addClickedElement(columnIndex: number): void {
        if (this.clickedElements.includes(columnIndex)) {
            return;
        }
        this.clickedElements = [...this.clickedElements, columnIndex];
	}

	fillTable(table: HTMLElement, rows: HTMLElement[]): void {
		rows.forEach((row) => {
			table.querySelector("tbody")?.appendChild(row);
		});
	}

    getColumnDataAt(id: number): Column {
        return this.columns[id];
    }

	getColumnIndex(th: HTMLElement) {
		return Array.prototype?.indexOf.call(this.getTableHeads(), th);
	}

	getTableHeads(): HTMLElement[] {
		return Array.from(this.element.querySelectorAll("th"));
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

	setActiveColumn(clickedColumn=this.clickedElements.length-1): void {
        /*   Activates the clicked column and sets the sorting mode accordingly.   */
        const column = this.getColumnDataAt(clickedColumn);
		if (this.clickedElements.length > 1) {
            // 
        }
        else if (this.column !== clickedColumn) {
            this.sorting = "neutral";
        }
		this.column = clickedColumn;
        column.update();
	}

	setClickedElement(column: number): void {
		this.clickedElements = [column];
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