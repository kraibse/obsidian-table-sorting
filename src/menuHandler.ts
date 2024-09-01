import TableSort from "main";


export interface ContextMenuInterface {
    element: Element,
    addAction: Function,
    addSectionHeader: Function,
    addSeparator: Function,
    plugin: TableSort,
}


export class ContextMenu implements ContextMenuInterface {
    plugin: TableSort;
    element: Element;

    constructor(element: Element | HTMLCollectionOf<Element>, plugin: TableSort) {
        // TableSort.log("Created context menu: ", element);
        if (element instanceof HTMLCollection) {
            this.element = element[0];
        } else {
            this.element = element as Element;
        }

        this.plugin = plugin;
    }


    addAction(action: Function, title: string, dataSection?: string) {
        const menuItemHTML = `
                <div class="menu-item-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-arrow-up-az">
                        <path d="m3 8 4-4 4 4"></path>
                        <path d="M7 4v16"></path>
                        <path d="M20 8h-5"></path>
                        <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"></path>
                        <path d="M15 14h5l-5 6h5"></path>
                    </svg>
                </div>
                <div class="menu-item-title">${title}</div>
        `;

        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        menuItem.setAttribute("data-section", dataSection || "");

        menuItem.innerHTML = menuItemHTML;

        menuItem.addEventListener("click", () => {
			action();
			document.body.removeChild(menuItem.parentElement as Node);
		});

        menuItem.addEventListener("mouseenter", () => {
            menuItem.parentElement?.querySelector(".selected")?.classList.remove("selected");
            menuItem.classList.add("selected");
        });

        menuItem.addEventListener("mouseleave", () => {
            menuItem.classList.remove("selected");
        });

        this.element.appendChild(menuItem);
    }

    addSectionHeader(title: string, alignment: "left" | "right" | "center" = "left") {
        const sectionHeader = document.createElement("div");
        sectionHeader.classList.add("menu-item");

        const margin: string = alignment == "left"
                                ? "margin-right: auto !important"
                            : alignment == "right"
                                ? "margin-left: auto !important"
                            : `margin-left: auto !important; margin-right: auto !important`

        const sectionHeaderHTML = `<p style="margin: 0 !important; ${margin}; color: var(--text-muted) !important;">${title}</p>`;
        sectionHeader.innerHTML = sectionHeaderHTML;
        
        this.element.appendChild(sectionHeader);
    }

    addSeparator() {
        const separator = document.createElement("div");
        separator.classList.add("menu-separator");
        this.element.appendChild(separator);
    }
}



export async function getMenuElement(event: MouseEvent, plugin: TableSort) {
	if (plugin.getViewMode() === "preview") {
		return spawnMenuElement(event);
	}

    const observer = new MutationObserver((mutations, observer) => {
		mutations.forEach((mutation) => {
			if (mutation.type == 'childList') {
				const addedNodes = mutation.addedNodes;
				for (let i = 0; i < addedNodes.length; i++) {
					const currentNode = addedNodes[i] as HTMLElement;
					const containsMenu = currentNode.classList.contains("menu");
					console.log(containsMenu);
					if (containsMenu) {
						observer.disconnect();
						return addedNodes[i];
					}
				}
			}
		});
	});

	observer.observe(document, { childList: true, subtree: true });

	const getOpenMenu = new Promise((resolve) => {
		const interval = setInterval(() => {
			const openMenus = document.getElementsByClassName("menu");
			if (openMenus.length > 0) {
				clearInterval(interval);
				const currentContextMenu = openMenus[0];
				resolve(currentContextMenu);
			}
		});
	});

    const menu = await getOpenMenu;
    return menu;
}


function spawnMenuElement(event: MouseEvent) {
	const menu = document.createElement("div");
	menu.classList.add("menu");
	
	menu.style.left = `${event.clientX}px`;
	menu.style.top = `${event.clientY}px`;
	
	document.addEventListener("click", (event) => {
		if (document.body.contains(menu as Node)) {
			document.body.removeChild(menu);
		}
	});

	document.body.appendChild(menu);
	return menu;
}
