import { DEFAULT_COLOR } from "@utils/colors";

export function getPreferredMode() {
    return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function getPrimaryColor(): string {
    // Read from BeerCSS variable
    return getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || DEFAULT_COLOR; // fallback
}

function loadTheme(overideMode?: string) {
    const mode = localStorage.getItem("mode") || getPreferredMode();
    ui("mode", overideMode || mode);

    const themeColor = localStorage.getItem("theme") || DEFAULT_COLOR;
    ui("theme", themeColor);

    // Update both theme-related meta tags
    updateMetaColors(themeColor);
}

export function invertImages() {
    const mode = ui("mode");
    const images = document.querySelectorAll<HTMLImageElement>('img:not(.ignore-invert)');
    images.forEach(image => {
        image.style.filter = mode === "light" ? "invert(0)" : "invert(0.9)";
    });
}

export function updateMetaColors(color?: string) {
    if (!color) {
        color = getPrimaryColor();
    }

    // Windows tile
    let tileMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="msapplication-TileColor"]'
    );

    if (!tileMeta) {
        tileMeta = document.createElement("meta");
        tileMeta.name = "msapplication-TileColor";
        document.head.appendChild(tileMeta);
    }
    tileMeta.content = color;

    // Browser address bar
    let themeMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
    );
    if (!themeMeta) {
        themeMeta = document.createElement("meta");
        themeMeta.name = "theme-color";
        document.head.appendChild(themeMeta);
    }
    themeMeta.content = color;
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    const newMode = e.matches ? "dark" : "light";
    ui("mode", newMode);
    updateMetaColors(); // re-sync
});

document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
});