import { DialogComponent } from "@components/common/dialogs/dialog-component";
import { SnackbarComponent } from "@components/common/snackbar/snackbar";

export class ShareColonyDialog extends DialogComponent {
    constructor() {
        super({
            id: "share-colony-dialog",
            title: "Share Colony",
            bodyContent: `<div class="grid">
                <button class="s12 border extra" class="responsive" id="copy-button">
                    <span id="link" class="underline"></span>
                    <i>content_copy</i>
                </button>
            </div>`,
        });
        this.init();
    }

    private updateLink() {
        const linkElement = this.element.querySelector("#link") as HTMLSpanElement;

        let link = window.location.href;

        linkElement.innerText = link;
    }

    init() {
        const copyButton = this.element.querySelector("#copy-button") as HTMLButtonElement;
        copyButton.addEventListener("click", () => {
            const link = this.element.querySelector("#link") as HTMLSpanElement;
            navigator.clipboard.writeText(link.textContent || "");
            SnackbarComponent.success("Link copied to clipboard!");
        });


        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        this.updateLink();
    }
}