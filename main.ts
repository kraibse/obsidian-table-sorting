import { Plugin, Menu, MarkdownViewModeType, MarkdownView } from 'obsidian';
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

	getTableElement(element: HTMLElement): HTMLTableElement | undefined {
		const isTableCell = this.isTableCell(element);
		TableSort.log("isTableCell: ", isTableCell);

		if (!isTableCell) {
			return undefined;
		}
		
		const viewMode = this.getViewMode();
		if (viewMode === "source") {
			return element.closest(".table-editor") as HTMLTableElement || undefined;
		}
		else if (viewMode === "preview") {
			return element.closest("table") as HTMLTableElement || undefined;	
		}
		else {
			return undefined;
		}

	}

	getTableID(table: HTMLElement): number {
		const id = table.getAttribute("id") ?.replace(idPrefix, "");
		return (id) ? parseInt(id) : this.gen.next().value;
	}

	getViewMode() {
		const currentView = this.app.workspace.getActiveViewOfType(MarkdownView);
		return currentView?.getMode();
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

	isTableCell (element: HTMLElement): boolean {
		const tableCellTags = ["TD", "TH", "TR"];
		const isNotTableCell = !(tableCellTags.includes(element.tagName));
		const isParentTableCell = tableCellTags.includes(element.parentElement?.tagName || "div");
		
		if (element.tagName === "DIV") {
			return isParentTableCell;
		}

		if (isNotTableCell) {
			return false;
		}
		
		return true;
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
		this.registerDomEvent(document, 'contextmenu', mousedownHandler, {
			capture: true
		});


		TableSort.log("( obsidian-table-sorting ) Plugin has finished loading.");
	}

	onunload() {
		this.storage = [];
	}
}
