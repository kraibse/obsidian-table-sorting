import { Plugin, Menu } from 'obsidian';
import { TableSortSettings, TableSortSettingsTab, DEFAULT_SETTINGS} from "./src/settings";
import { Table, idPrefix } from "./src/table";
import { getMousedownHandler } from "./src/mouseHandler"


export default class TableSort extends Plugin {
	static settings: TableSortSettings;

	storage: Table[] = [];
	gen: any;

	* autoIncrement() {
		let index = 0;
		while (true) {
			yield index++;
		}
	}

	getTableElement(th: HTMLElement): HTMLTableElement | undefined {
		return th.closest(".table-editor") as HTMLTableElement || undefined;
	}

	getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id") ?.replace(idPrefix, "");
		return (id) ? parseInt(id) : this.gen.next().value;
	}

	hasCustomClasses(table: HTMLElement): boolean {
		const classes = table.getAttribute("class") || "";
		if (classes.length > 0) {
			return true;
		}
		return false;
	}

	isNewTable(id: number): boolean {
		//  Return true if the user has selected a new table
		return (this.storage.length - 1 >= id) ? false : true;
	}

	async loadSettings() {
		TableSort.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	
	static log(out?: any, ...optionalParams: any[]): void {
		if (this.settings.isDevmodeEnabled === false) {
			return;
		}
		console.log(out, optionalParams);
	}

	async saveSettings() {
		await this.saveData(TableSort.settings);
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new TableSortSettingsTab(this.app, this));

		this.gen = this.autoIncrement();
		this.storage = [];

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
								const cell = document.querySelector("th:hover, td:hover");
				if (!cell) return;
				const tableElement = cell.closest(".table-editor");
				if (!tableElement) return;

				const tableID = this.getTableID(tableElement as HTMLElement);
				let table: Table;
				if (this.isNewTable(tableID)) {
					table = new Table(tableID, tableElement as HTMLTableElement, this);
					this.storage.push(table);
				} else {
					table = this.storage[tableID];
				}
				const columnIndex = table.getColumnIndex(cell as HTMLElement);
				const column = table.getColumn(columnIndex);

				menu.addSeparator();
				menu.addItem((item) =>
					item.setTitle("Sort temporarily by column (A to Z)")
						.setIcon("arrow-up-a-z")
						.onClick(() => {
							table.handleClick(column);
							column.order = "ascending";
							table.sort();
							table.updateColumns();
						})
				);
				menu.addItem((item) =>
					item.setTitle("Sort temporarily by column (Z to A)")
						.setIcon("arrow-down-z-a")
						.onClick(() => {
							table.handleClick(column);
							column.order = "descending";
							table.sort();
							table.updateColumns();
						})
				);
				menu.addItem((item) =>
					item.setTitle(column.isSelected ? "Deselect" : "Select")
						.setIcon("check-circle")
						.onClick(() => {
							if (column.isSelected) {
								column.deselect();
								table.removeFilter(column);
							} else {
								column.select();
								if (!table.containsColumn(column)) {
									table.filters.push(column);
								}
							}
							table.updateColumns();
						})
				);
				menu.addItem((item) =>
					item.setTitle("Reset filters")
						.setIcon("rotate-ccw")
						.onClick(() => {
							table.reset();
						})
				);
			})
		);


		TableSort.log("( obsidian-table-sorting ) Plugin has finished loading.");
	}

	onunload() {
		this.storage = [];
	}
}
