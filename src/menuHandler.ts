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

        menuItem.addEventListener("click", () => { action(); });

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



export async function getMenuElement() {
    // TODO: Convert to HtmlObserver to remove the hardcoded waiting time
    
    const getOpenMenu = new Promise((resolve, reject) => {
        var openedMenus:  HTMLCollectionOf<Element>;
        setTimeout(() => {
            openedMenus = document.getElementsByClassName("menu");
            (!openedMenus || openedMenus.length == 0) ? resolve(null) : resolve(openedMenus);
        }, 1);
    });

    getOpenMenu.then((result: HTMLCollectionOf<Element> | undefined) => {
        if (!result) {
            TableSort.log("Did not find the contextmenu...");
            return null;
        }

        return result[0];
    });

    const menu = await getOpenMenu;
    return await getOpenMenu;
}

