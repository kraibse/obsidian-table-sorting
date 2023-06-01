import TableSort from "../main";

export class Column {
	id: number;
	order: string;
	element: HTMLElement;

	constructor(id: number, element: HTMLElement, order="neutral") {
		this.id = id;
		this.element = element;
		this.order = order;
	}

	getName(): string {
		return this.element?.innerHTML;
	}

	getWeight(): number {
		if (this.order == "neutral") {
			return 0;
		}
		return (this.order == "ascending")? 1: -1; 
	}

	reset() {

	}

    setIcon() {
        this.element.classList.remove("neutral");
		this.element.classList.remove("ascending");
		this.element.classList.remove("descending");

        this.element.classList.add(this.order);
    }

	setLabel (label: string) {
		TableSort.log("Setting '" + this.getName() + "' to " + label, this.order);
		
		this.element.setAttribute('data-content', label);
	}

	update(): string {
		/* Updates the order mode and updates column CSS class */
        this.order = (this.order === "neutral") ? "descending"
                    : (this.order === "ascending") ? "neutral"
                    : "ascending";

		this.setIcon();
		return this.order;
	}
}
