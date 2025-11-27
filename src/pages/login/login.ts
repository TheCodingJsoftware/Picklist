import "beercss"
import "material-dynamic-colors"
import "@utils/theme"
import "@static/css/global.css"
import "@components/login/login-component"
import "@components/common/footer/footer-component"

document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body")
    if (body) {
        const colonyTheme = body.getAttribute("data-theme")
        if (colonyTheme) {
            ui("theme", colonyTheme);
        }
    }
});