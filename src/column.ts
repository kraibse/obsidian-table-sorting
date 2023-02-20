export class Column {
	id: number;
	order: string;
	element: HTMLElement;
	queueID: number;

	constructor(id: number, element: HTMLElement, order="neutral") {
		this.id = id;
		this.element = element;
		this.order = order;
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

	setLabel (id=-1) {
		const label = (id >= 0) ? "(" + id + ")" : " ";
		console.log("Setting label to " + label);
		
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
