import { HelpDialog } from "@components/common/dialogs/help-dialog"; // adjust path


export class HelpButton extends HTMLAnchorElement {
    constructor() {
        super();

        this.innerHTML = `
            <i>help</i>
            <span class="l m">Help</span>
        `;

        this.href = "javascript:void(0)";
    }

    connectedCallback() {
        this.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            new HelpDialog();
        });
    }
}

customElements.define("help-button", HelpButton, { extends: "a" });
