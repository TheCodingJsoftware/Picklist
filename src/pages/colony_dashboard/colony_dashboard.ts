import "beercss"
import "material-dynamic-colors"
import "@utils/theme"
import { LoginDialog } from "@components/common/dialogs/login-dialog"
import "@components/common/button/help-button"
import "@components/common/button/share-button"

document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body")
    if (body) {
        const colonyTheme = body.getAttribute("data-theme")
        if (colonyTheme) {
            ui("theme", colonyTheme);
        }
    }

    const loginButton = document.getElementById("login-button");
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            new LoginDialog();
        });
    }
})