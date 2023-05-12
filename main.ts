import { Plugin } from 'obsidian';
import { TableSortSettings, TableSortSettingsTab, DEFAULT_SETTINGS} from "./src/settings";
import { Table } from "./src/table";
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
		return th.closest("table") || undefined;
	}

	getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id") ?.replace("table-", "");
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

		const mousedownHandler = getMousedownHandler(this);
		this.registerDomEvent(document, 'click', mousedownHandler, {
			capture: true
		});

		console.log("( obsidian-table-sorting ) Plugin has finished loading.");
	}

	onunload() {
		this.storage = [];
	}
}
