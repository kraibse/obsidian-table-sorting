import TableSort from "../main";
import { Column } from "./column";


export const idPrefix: string = "ots-rt-";

export class Table {

	id: number = -1;
	column: number;
	plugin: TableSort;

	filters: Column[] = [];
	element: HTMLElement;
	currentOrder: HTMLElement[];
	originalOrder: HTMLElement[];

	columns: Column[] = [];

	constructor(id: number, element: HTMLTableElement, plugin: TableSort) {
		this.id = id || 0;
		this.element = element;
		this.plugin = plugin;
		element.setAttribute("id", `${idPrefix}${id.toString()}`);
		this.currentOrder = this.getTableRows();
		this.originalOrder = this.currentOrder;
	}

	_resetOtherColumns(column: Column): void {
		this.columns.filter((c) => c !== column).forEach((c) => {
			c.deselect();
		});
	}

	_updateLabels(): void {
		this.filters.forEach((e, i) => {
			e.setLabel("(" + i.toString() + ")");
			e.setIcon();
		});
	}

	containsColumn(column: Column): boolean {
		const contains = this.filters.includes(column);
		TableSort.log(contains, this.filters);
		return this.filters.includes(column);

	}

	deselectAll(): void {
		TableSort.log("Deselecting all: ", this.columns);

		// TableSort.log("Done deselecting all");
	}

	handleClick(column: Column): void {
		/**
		 * Handles the click event on a column.
		 *
		 * @param {Column} column - The column that was clicked.
		 * @param {boolean} isPressingCtrl - Indicates whether the Ctrl key is being pressed.
		 * @return {void} This function does not return anything.
		 */

		if (column.isSelected) return;

		if (!this.containsColumn(column)) {
			this.reset();
		}
		
		this.filters.push(column);
		column.select();

		// this.updateColumns();

		// const isAlreadyFiltered = this.filters.includes(column);
		// if (isAlreadyFiltered && column.order === "neutral") {
		// 	this.removeFromFilters(column);
		// }
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

		const column = this.getColumn(position);
		const cells = [column.element];

		this.getTableRows().forEach((row) => {
			const cell = row.querySelectorAll("td")[column.id];
			cells.push(cell);
		});

		return cells;
	}

	getColumn(id: number): Column {
		// if (id == -1) {
		// 	return new Column(id, element, "neutral");
		// }
		const element: HTMLElement = this.getTableHeads()[id];
		if (!this.columns[id]) {
			const column = new Column(id, element, "neutral", this);
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

		const cell: HTMLElement | null = (tag == "DIV") ? element.parentElement : element;
		const siblings = Array.prototype.slice.call(cell?.parentElement?.children);

		return siblings.indexOf(cell);
	}

	getFilterPriority(column: Column): number {
		return this.filters.indexOf(column);
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

	removeFilter(column: Column): void {
		this.filters.splice(this.filters.indexOf(column), 1);
		column.deselect();
		column.update();
	}

	removeFromFilters(column: Column): void {
		this.filters.splice(this.filters.indexOf(column), 1);
	}

	removeRows(rows: HTMLElement[]): void {
		Array.from(rows).forEach((row) => {
			row.remove();
		});
	}

	reset() {
		this.filters = [];
		this.columns.forEach((c) => {
			c.deselect();
		});

		this.currentOrder = this.originalOrder;
		this.sort();
	}

	selectColumn(column: Column): void {
		const cells = [column.element].concat(this.getTableRows());

		cells.forEach((row, position) => {
			const isTopRow = position == 0;
			const isBottomRow = position == (cells.length - 1);
			const cellType = isTopRow ? "th" : "td";

			// TableSort.log("Selecting column ", row, this.element.querySelector(cellType));
			const cell = isTopRow ? column.element : row.querySelectorAll(cellType)[column.id];

			const classes = ['is-selected', 'start', 'end'];

			if (isTopRow) {
				classes.push('top');
			}
			if (isBottomRow) {
				classes.push('bottom');
			}

			// TableSort.log(cell);
			if (!cell.classList.contains("is-selected")) {
				cell.classList.add(...classes);
			}
			// TableSort.log(cell, classes, cell.classList, ...classes.split(" "));
			// TableSort.log((isTopRow) ? column.element : undefined);
			// TableSort.log(isTopRow, isBottomRow, cellType);
		});

		column.select();
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

	updateColumns() {
		this.columns.forEach((column) => {
			if (!this.containsColumn(column)) {
				column.deselect();
				console.log("Deselecting column", column);
			}
			else {
				column.select();
			}
			column.update();
		});
	}

	updateElement() {
		const element = document.getElementById(`${idPrefix}${this.id.toString()}`) as HTMLElement;
		if (!element) {
			console.error("Found no registered table with the corresponding id.");
		}
	}
}
