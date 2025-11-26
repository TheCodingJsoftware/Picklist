import "beercss"
import "material-dynamic-colors"
import "@utils/theme"

document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body")
    if (body) {
        const colonyTheme = body.getAttribute("data-theme")
        if (colonyTheme) {
            ui("theme", colonyTheme);
        }
    }
})