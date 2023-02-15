export class Column {
	id: number;
	order: string;
	element: HTMLElement;

	constructor(id: number, element: HTMLElement, order: string) {
		this.id = id;
		this.element = element;
		this.order = order;
	}

	reset() {

	}

    setIcon() {
        this.element.classList.remove("neutral");
		this.element.classList.remove("ascending");
		this.element.classList.remove("descending");

        this.element.classList.add(this.order);
    }

	update() {
		/* Updates the order mode and updates column CSS class */
        this.order = (this.order === "neutral") ? "descending"
                    : (this.order === "ascending") ? "neutral"
                    : "ascending";

		this.setIcon();
	}
}
