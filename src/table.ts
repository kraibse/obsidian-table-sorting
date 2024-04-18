import TableSort from "../main";
import { Column } from "./column";


export const idPrefix: string = "ots-rt-";

export class Table {

	id: number;
	column: number;
	plugin: TableSort;

	filters: Column[];
	element: HTMLElement;
	currentOrder: HTMLElement[];
	originalOrder: HTMLElement[];

	columns: Column[];

	constructor(id: number, element: HTMLTableElement, plugin: TableSort) {
		this.id = id || 0;
		this.element = element;
		this.plugin = plugin;
		this.filters = [];
		this.columns = [];
		this.column = -1;
		this.filters = [];
		element.setAttribute("id", `${idPrefix}${id.toString()}`);
		this.currentOrder = this.getTableRows();
		this.originalOrder = this.currentOrder;
	}

	_resetOtherColumns(column: Column): void {
		this.columns.filter((c) => c !== column).forEach((c) => {
			c.reset();
		});
	}

	_revertColumn(column: Column): void {
		this.filters.splice(this.filters.indexOf(column), 1);
		column.setLabel("");	
	}

	_updateLabels(): void {
		this.filters.forEach((e, i) => {
			e.setLabel("(" + i.toString() + ")");
			e.setIcon();
		});
	}

	deselectAll(): void {
		console.log("Deselecting all: ", this.columns);
		for (let i = 0; i < this.getTableHeads().length; i++) {
			let cells = this.getColumnCells(i);

			cells.forEach((cell) => {
				cell.classList.remove('is-selected', 'top', 'bottom');
			});
		}
		// console.log("Done deselecting all");
	}

	handleClick(column: Column, isPressingCtrl: boolean): void {
		/**
		 * Handles the click event on a column.
		 *
		 * @param {Column} column - The column that was clicked.
		 * @param {boolean} isPressingCtrl - Indicates whether the Ctrl key is being pressed.
		 * @return {void} This function does not return anything.
		 */
		
		if (isPressingCtrl) {
			this.filters.push(column);
		}
		else {
			this._resetOtherColumns(column);
			this.filters = [column];
		}
		
		const isAlreadyFiltered = this.filters.includes(column);
		if (isAlreadyFiltered && column.order === "neutral") {
			this.removeFromFilters(column);
		}
	}

	fillTable(): void {
		this.currentOrder.forEach((row) => {
			this.element.querySelector("tbody")?.appendChild(row);
		});
	}

	getColumnCells(position: number): HTMLElement[] {
		/**
		 * Retrieves the cells for a specific column position.
		 *
		 * @param {number} position - The position of the column.
		 * @return {HTMLElement[]} An array of HTMLElement representing the cells of the column.
		 */

		// if (position < 0 || position >= this.columns.length - 1) {
		// 	return [];
		// }
		
		const column = this.getColumnDataAt(position);
		const cells = [column.element];

		this.getTableRows().forEach((row) => {
			const cell = row.querySelectorAll("td")[column.id];
			cells.push(cell);
		});

		return cells;
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

	getColumnIndex(element: HTMLElement) {
		if (!element) {
			return -1;
		}
		// this.updateElement();

		const tag = element.tagName;

		const cell: HTMLElement = (tag == "DIV") ? element.parentElement : element;
		const siblings = Array.prototype.slice.call( cell?.parentElement?.children );

		return siblings.indexOf(cell);
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

	removeFromFilters(column: Column): void {
		this.filters.splice(this.filters.indexOf(column), 1);
	}

	removeRows(rows: HTMLElement[]): void {
		Array.from(rows).forEach((row) => {
			row.remove();
		});
	}

	selectColumn(column: Column): void {
		const cells = [column.element].concat(this.getTableRows());

		cells.forEach((row, position) => {
			const isTopRow = position == 0;
			const isBottomRow = position == (cells.length - 1);
			const cellType = isTopRow ? "th" : "td";

			// console.log("Selecting column ", row, this.element.querySelector(cellType));
			const cell = isTopRow ? column.element : row.querySelectorAll(cellType)[column.id];

			const classes = ['is-selected', 'start', 'end'];
			
			if (isTopRow) {
				classes.push('top');
			}
			if (isBottomRow) {
				classes.push('bottom');
			}

			// console.log(cell);
			if (!cell.classList.contains("is-selected")) {
				cell.classList.add(...classes);
			}
			// console.log(cell, classes, cell.classList, ...classes.split(" "));
			// console.log((isTopRow) ? column.element : undefined);
			// console.log(isTopRow, isBottomRow, cellType);
		});
	}

	sort(): void {
		const compareRows = (rowA: HTMLElement, rowB: HTMLElement) => {
			for (const filter of this.filters) {

				const cellA = rowA.children[filter.id] as HTMLTableCellElement;
				const cellB = rowB.children[filter.id] as HTMLTableCellElement;

				if (!cellA || !cellB) {
					return 0;
				}

				const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : "";
				const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : "";

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
			this.currentOrder = Array.from(this.currentOrder).sort((rowA, rowB) => {
				return compareRows(rowA, rowB);
			});
			TableSort.log("[obsidian-table-sorting] sort() - Finished sorting trows.")
		}

		// this.removeRows();
		this.fillTable();
	}

	updateElement() {
		const element = document.getElementById(`${idPrefix}${this.id.toString()}`) as HTMLElement;
		if (!element) {
			console.error("Found no registered table with the corresponding id.");
		}
	}
}
