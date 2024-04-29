import TableSort from "../main";
import { Table } from "./table";
import { DRAG_HANDLE, SORT_SELECTED, SORT_ASC, SORT_DESC } from "./icons";


export class Column {
	element: HTMLElement;
	id: number;
	isSelected: boolean = false;
	parent: Table;
	order: "ascending" | "descending" | "neutral" = "neutral";

	constructor(id: number, element: HTMLElement, order: "ascending" | "descending" | "neutral", parent: Table) {
		this.id = id;
		this.element = element;
		this.parent = parent;
		this.order = order;
	}

	deselect() {
		this.isSelected = false;
		this.order = "neutral";
		this.resetIcon();

		const cells = this.parent.getColumnCells(this.id);

		cells.forEach((cell) => {
			cell.classList.remove('is-selected', 'top', 'bottom');
		});	

		this.update();
	}

	getHandle(): HTMLDivElement | null {
		return this.element.querySelector(".table-col-drag-handle");
	}

	getIcon(): string {
		if (!this.isSelected) {
			return DRAG_HANDLE;
		}
		
		let icon;
		switch (this.order) {
			case "ascending":
				icon = SORT_ASC;
				break;
			case "descending":
				icon = SORT_DESC;
				break;
			default:
				icon = SORT_SELECTED;
		}
		return icon;
	}

	getName(): string {
		return this.element.querySelector(".table-cell-wrapper")?.innerHTML || "No name";
	}

	getWeight(): number {
		if (this.order == "neutral") {
			return 0;
		}
		return (this.order == "ascending")? 1: -1; 
	}

	resetIcon() {
		let handle = this.element.querySelector(".table-col-drag-handle");
		if (!handle) return;

		handle.innerHTML = DRAG_HANDLE;
		handle.classList.remove("opacity-100");
	}

	select() {
		this.isSelected = true;

		const cells = [this.element].concat(this.parent.getTableRows());

		cells.forEach((row, position) => {
			TableSort.log(position);

			
			const isTopRow = position == 0;
			const isBottomRow = position == (cells.length - 1);
			const cellType = isTopRow ? "th" : "td";
			
			// TableSort.log("Selecting this ", row, this.element.querySelector(cellType));
			const cell = isTopRow ? this.element : row.querySelectorAll(cellType)[this.id];
			cell.classList.remove('is-selected', 'top', 'bottom');

			const classes = ['is-selected', 'start', 'end'];
			
			if (isTopRow) {
				classes.push('top');
			}
			if (isBottomRow) {
				classes.push('bottom');
			}

			if (!cell.classList.contains("is-selected")) {
				cell.classList.add(...classes);
			}
		});
	}

    setIcon() {
		const handle = this.getHandle();
		if (!handle) return;
		
		handle.innerHTML = this.getIcon();
		handle.classList.add("opacity-100");
    }

	setLabel (label: string) {
		const handle = this.getHandle();
		if (!handle) return;

		handle.setAttribute('data-content', label);
		handle.innerHTML = label;
	}

	update() {
		/**
		 * Check if the column is short and update the label indicator accordingly.
		 */
		const handle = this.getHandle();
		if (!handle) return;

		if (!this.isSelected) {
			this.isSelected = false;
			handle?.classList.remove("opacity-100");
		}
		else {
			this.select();
			handle?.classList.add("opacity-100");
		}
		
		const isShort = handle.offsetWidth < 100;

		if (isShort) {
			handle.classList.add("short");
		}
		else {
			handle.classList.remove("short");
		}

		const icon = this.getIcon();
		const priority = this.parent.getFilterPriority(this);
		const canBeShown = (priority !== -1 && this.isSelected);

		const label = icon + (canBeShown ? ` (${priority})` : ""); ;
		this.setLabel(label);
	}
}
