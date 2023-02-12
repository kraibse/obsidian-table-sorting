import {
	Plugin
} from 'obsidian';

export default class TableSort extends Plugin {
	statusBarItem: HTMLElement;
	statusBarReload: HTMLElement;

	// const icons = {
	// unsorted: color => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray">
	// 	<path d="M15 8H1l7-8zm0 1H1l7 7z" opacity=".2"/>
	// </svg>`,
	// 	ascending: color => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray">
	// 		<path d="M15 8H1l7-8z"/>
	// 		<path d="M15 9H1l7 7z" opacity=".2"/>
	// 	</svg>`,
	// 	descending: color => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray">
	// 		<path d="M15 8H1l7-8z" opacity=".2"/>
	// 		<path d="M15 9H1l7 7z"/>
	// 	</svg>`
	// };

	lastSorted = {
		columnIndex: 0,
		isAscending: true
	};

	private getTableElement(th: HTMLElement): HTMLElement | undefined {
		return th.closest("table") || undefined;
	}

	private getTableHeads(table: HTMLElement): NodeListOf < HTMLTableCellElement > {
		return table.querySelectorAll("th");
	}

	private getTableRows(table: HTMLElement): HTMLElement[] {
		const rowElements = table.querySelectorAll("tr");
		return Array.from(rowElements).splice(1, rowElements.length);
	}

	private getColumnIndex(thead: NodeListOf < HTMLElement > , th: HTMLElement): number {
		return Array.prototype.indexOf.call(thead, th);
	}

	async onload() {
		console.log(this.needsDarkTheme());

		const theads = document.querySelectorAll("th") as NodeListOf < HTMLTableCellElement > ;
		this.updateIcons(theads, -1);

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			if (evt.target == null) {
				return;
			}

			const element: HTMLElement = evt.target;

			if (element.tagName === "TH") {
				evt.preventDefault();
				this.sortTable(element);
			}
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}



	sortTable(th: HTMLElement) {
		const tableElement = this.getTableElement(th);
		if (!tableElement) {
			return;
		}

		const theads = this.getTableHeads(tableElement);
		const rows = this.getTableRows(tableElement);
		const columnID = this.getColumnIndex(theads, th);

		this.updateSortingMode(columnID);
		this.updateIcons(theads, columnID);

		const sortColumnValue = (rowA: HTMLElement, rowB: HTMLElement) => {
			const cellA = rowA.children[columnID] as HTMLTableCellElement;
			const cellB = rowB.children[columnID] as HTMLTableCellElement;

			if (!cellA || !cellB) {
				return 0;
			}

			const valueA = cellA.textContent ? cellA.textContent.toLowerCase() : false;
			const valueB = cellB.textContent ? cellB.textContent.toLowerCase() : false;

			return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
		};

		// Sort the rows by the values in the sort column
		const sortedRows = Array.from(rows).sort((rowA, rowB) => {
			const comparison = sortColumnValue(rowA, rowB);
			return this.lastSorted.isAscending ? comparison : -comparison;
		});

		// Remove all the rows from the table
		Array.from(rows).forEach((row) => {
			row.remove();
		});

		// Append the sorted rows to the table
		sortedRows.forEach((row) => {
			tableElement.querySelector("tbody").appendChild(row);
		});
	}

	updateIcons(theads: NodeListOf < HTMLTableCellElement > , columnID: number) {
		theads.forEach((thead, index) => {
			thead.classList.remove("neutral");
			thead.classList.remove("ascending");
			thead.classList.remove("descending");

			console.log("Changing class on column " + index);

			if (columnID === index) {
				thead.classList.add(this.lastSorted.isAscending ? "ascending" : "descending");
			} else {
				thead.classList.add("neutral");
			}
		});
	}

	updateSortingMode(columnID: number) {
		if (this.lastSorted.columnIndex === columnID) {
			this.lastSorted.isAscending = !this.lastSorted.isAscending;
		} else {
			this.lastSorted.isAscending = true;
			this.lastSorted.columnIndex = columnID;
		}
	}

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
