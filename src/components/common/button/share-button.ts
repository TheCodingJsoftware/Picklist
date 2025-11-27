import { ShareColonyDialog } from "../dialogs/share-colony-dialog";

export class ShareButton extends HTMLAnchorElement {
    constructor() {
        super();

        this.innerHTML = `
            <i>share</i>
            <span class="l m">Share</span>
        `;

        this.href = "javascript:void(0)";
    }

    connectedCallback() {
        this.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            new ShareColonyDialog();
        });
    }
}

customElements.define("share-button", ShareButton, { extends: "a" });
