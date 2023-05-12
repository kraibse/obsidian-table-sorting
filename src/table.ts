import TableSort from "../main";
import { Column } from "./column";

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
		element.setAttribute("id", id.toString());
		this.currentOrder = this.getTableRows();
		this.originalOrder = this.currentOrder;
	}

	_resetOtherColumns(column: Column): void {
		this.columns.forEach((e) => {
			if (e !== column) {
				e.order = "neutral";
				e.setLabel("");
			}
			else {
				column.update();
			}
			e.setIcon();
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

	handleClick(column: Column, isPressingCtrl: boolean): void {
		// sets the order for the column selection
		const isRegistered = this.filters.includes(column);
		
		if (!isPressingCtrl) {
			if (!isRegistered) {
				column.order = "neutral";
			}
			this.filters = [column];
			this._resetOtherColumns(column);
		}
		else {			
			if (!isRegistered) {
				column.order = "neutral";
				this.filters.push(column);
			}
			column.update();
		}

		if (column.order == "neutral") {
			this._revertColumn(column);
		}

		this._updateLabels();
	}

	fillTable(): void {
		this.currentOrder.forEach((row) => {
			this.element.querySelector("tbody")?.appendChild(row);
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
		const compareRows = (rowA: HTMLElement, rowB: HTMLElement) => {
			for (const filter of this.filters) {

				const cellA = rowA.children[filter.id] as HTMLTableCellElement;
				const cellB = rowB.children[filter.id] as HTMLTableCellElement;

				if (!cellA || !cellB) {
					return 0;
				}

				const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : false;
				const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : false;

				if (valueA < valueB || valueA == false) {
					return -1 * filter.getWeight();
				}
				if (valueA > valueB || valueB == false) {
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
		const element = document.getElementById(this.id.toString()) as HTMLElement;
		if (!element) {
			console.error("Found no registered table with the corresponding id.");
		}
	}
}
