import { DialogComponent } from "@components/common/dialogs/dialog-component";

export class HelpDialog extends DialogComponent {
    constructor() {
        super({
            id: "help-dialog",
            title: "Help",
            bodyContent: `<p>For questions, comments, or concerns about this service, please email <a class="underline link" href="mailto:jared@hbni.net">jared@hbni.net</a></p>`,
        });
        this.init();
    }

    init() {
        window.addEventListener("resize", this.handleResize);
        this.handleResize()
    }
}