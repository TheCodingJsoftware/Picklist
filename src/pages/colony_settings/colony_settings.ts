import "beercss"
import "material-dynamic-colors"
import "@utils/theme"
import "@components/register/register-component"

document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body")
    if (body) {
        const colonyTheme = body.getAttribute("data-theme")
        if (colonyTheme) {
            ui("theme", colonyTheme);
        }
    }
})