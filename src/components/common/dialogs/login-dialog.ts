import { DialogComponent } from "@components/common/dialogs/dialog-component";
import "@components/login/login-component";

export class LoginDialog extends DialogComponent {
    constructor() {
        super({
            id: "login-dialog",
            title: "Login",
            bodyContent: `<login-component></login-component>`,
        });
        this.init();
    }

    init() {
        window.addEventListener("resize", this.handleResize);
        this.handleResize()
    }
}