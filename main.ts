import {
	Plugin
} from 'obsidian';

export default class TableSort extends Plugin {
	statusBarItem: HTMLElement;
	statusBarReload: HTMLElement;

	const icons = {
		unsorted: color => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${color}">
			<path d="M15 8H1l7-8zm0 1H1l7 7z" opacity=".2"/>
		</svg>`,
		ascending: color => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${color}">
			<path d="M15 8H1l7-8z"/>
			<path d="M15 9H1l7 7z" opacity=".2"/>
		</svg>`,
		descending: color => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${color}">
			<path d="M15 8H1l7-8z" opacity=".2"/>
			<path d="M15 9H1l7 7z"/>
		</svg>`
	};

	lastSorted = {
		columnIndex: 0,
		isAscending: true
	};

	async onload() {
		console.log(this.needsDarkTheme());
		this.statusBarItem = this.addStatusBarItem();

		const thead = document.querySelectorAll("th") as NodeListOf < HTMLTableCellElement > ;
		thead.forEach((e) => {

		});

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
		const tableElement = th.closest("table");

		if (tableElement == null) {
			return undefined;
		}

		const thead = tableElement.querySelectorAll("th");

		const rowElements = tableElement.querySelectorAll("tr");
		const rows = Array.from(rowElements).splice(1, rowElements.length);

		// Determine the index of the column to sort by
		const sortColumnIndex = Array.prototype.indexOf.call(thead, th);

		if (this.lastSorted.columnIndex === sortColumnIndex) {
			this.lastSorted.isAscending = !this.lastSorted.isAscending;
		} else if (this.lastSorted.columnIndex !== sortColumnIndex) {
			this.lastSorted.isAscending = true;
			this.lastSorted.columnIndex = sortColumnIndex;
		}

		this.statusBarItem.setText(th.getText());

		// Sort the rows by the values in the sort column
		const sortedRows = Array.from(rows).sort((rowA, rowB) => {
			const cellA = rowA.children[sortColumnIndex] as HTMLTableCellElement;
			const cellB = rowB.children[sortColumnIndex] as HTMLTableCellElement;

			if (cellA == undefined || cellB == undefined) {
				return 0;
			}

			const valueA = cellA.textContent ? .toLowerCase() ? ? false;
			const valueB = cellB.textContent ? .toLowerCase() ? ? false;

			if (this.lastSorted.isAscending) {
				if (valueA < valueB) {
					return -1;
				} else if (valueA > valueB) {
					return 1;
				} else {
					return 0;
				}
			} else {
				if (valueA < valueB) {
					return 1;
				} else if (valueA > valueB) {
					return -1;
				} else {
					return 0;
				}
			}
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

	onunload() {

	}

	needsDarkTheme() {
		// color will be "rgb(#, #, #)" or "rgba(#, #, #, #)"
		let color = window.getComputedStyle(document.body).backgroundColor;
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
