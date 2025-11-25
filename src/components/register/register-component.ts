import { SnackbarComponent } from "@components/common/snackbar/snackbar";

export class RegisterComponent extends HTMLElement {
    private selectedColor: string | null = null;
    private selectedBannerFile: File | null = null;

    constructor() {
        super();

        this.innerHTML = `
        <article class="round border no-padding">
            <img class="responsive small top-round pointer"
                src="/static/images/placeholder-banner.png"
                id="colony-banner">

            <nav class="row no-margin tiny-padding">
                <label class="helper small-padding">
                    Colony Banner
                </label>
                <input
                    type="file"
                    id="banner-input"
                    accept="image/*"
                    style="display: none;"
                >
                    <div class="max"></div>
                <button class="chip" id="add-banner-button" title="Add Banner">
                    <i>upload</i>
                    <span>Upload Banner</span>
                </button>
                <button class="chip" id="remove-banner-button" title="Remove Banner">
                    <i>delete</i>
                    <span>Remove Banner</span>
                </button>
            </nav>

            <div class="padding grid">
                <div class="s12 round field label border">
                    <input type="text" id="colony">
                    <label>Colony Name</label>
                </div>

                <div class="s12 m6 l6 round field label border bottom-margin">
                    <input type="text" id="username">
                    <label>Username</label>
                    <span class="helper">Your first & last name</span>
                </div>

                <div class="s12 m6 l6 round field label border bottom-margin">
                    <input type="password" id="password">
                    <label>Password</label>
                    <span class="helper">Choose a strong password</span>
                </div>

                <fieldset class="s12 small-round">
                    <legend>Colony Theme</legend>
                    <div class="row wrap" id="theme-buttons">
                        ${this.themeButtons()}
                    </div>
                </fieldset>

                <nav class="s12 right-align">
                    <button id="registerButton">
                        <i>login</i>
                        <span>Register</span>
                    </button>
                </nav>
            </div>
        </article>
        `;
    }
    connectedCallback() {
        // DEFAULT COLOR (e.g., #2196f3 blue)
        this.selectedColor = "#2196f3";

        // highlight default color
        const defaultBtn = this.querySelector(`[data-color="${this.selectedColor}"]`);
        defaultBtn?.classList.add("selected");

        // clicking image opens the file selector
        this.querySelector("#colony-banner")?.addEventListener("click", () => {
            (this.querySelector("#banner-input") as HTMLInputElement).click();
        });

        // upload button also opens selector
        this.querySelector("#add-banner-button")?.addEventListener("click", () => {
            (this.querySelector("#banner-input") as HTMLInputElement).click();
        });

        // preview banner
        this.querySelector("#banner-input")?.addEventListener("change", (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                this.selectedBannerFile = file;
                const img = this.querySelector("#colony-banner") as HTMLImageElement;
                img.src = URL.createObjectURL(file);
                SnackbarComponent.info("Banner selected.");
            }
        });

        // REMOVE banner
        this.querySelector("#remove-banner-button")?.addEventListener("click", () => {
            this.selectedBannerFile = null;

            const img = this.querySelector("#colony-banner") as HTMLImageElement;
            img.src = "/static/images/placeholder-banner.png";

            // Clear file input
            const input = this.querySelector("#banner-input") as HTMLInputElement;
            input.value = "";

            SnackbarComponent.success("Banner removed.");
        });

        // theme preset buttons
        this.querySelectorAll("[data-color]").forEach(btn => {
            btn.addEventListener("click", (ev) => {
                const color = (ev.currentTarget as HTMLElement).dataset.color!;
                this.selectedColor = color;

                // highlight selected
                this.querySelectorAll("[data-color]").forEach(b => b.classList.remove("selected"));
                (ev.currentTarget as HTMLElement).classList.add("selected");
            });
        });

        // free color picker
        this.querySelector("#select-color")?.addEventListener("input", (ev) => {
            const color = (ev.target as HTMLInputElement).value;
            this.selectedColor = color;

            // remove highlight from preset buttons
            this.querySelectorAll("[data-color]").forEach(b => b.classList.remove("selected"));
        });

        // register button
        this.querySelector("#registerButton")
            ?.addEventListener("click", () => this.register());
    }


    themeButtons() {
        const colors = [
            "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
            "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39",
            "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
        ];

        return colors
            .map(c => `<button class="circle small" data-color="${c}" style="background:${c}"></button>`)
            .join("") +
            `<button class="circle small">
                <i>palette</i>
                <input type="color" id="select-color">
            </button>`;
    }

    async register() {
        const username = (this.querySelector("#username") as HTMLInputElement).value;
        const password = (this.querySelector("#password") as HTMLInputElement).value;
        const colony = (this.querySelector("#colony") as HTMLInputElement).value;

        if (!username || !password || !colony) {
            SnackbarComponent.error("Please fill in all required fields.");
            return;
        }

        if (!this.selectedColor) {
            SnackbarComponent.error("Please select a colony theme color.");
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("colony", colony);
        formData.append("theme_color", this.selectedColor);

        if (this.selectedBannerFile) {
            formData.append("banner", this.selectedBannerFile);
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                body: formData // NOT JSON
            });

            const result = await response.json();

            if (result.error) throw new Error(result.error);

            SnackbarComponent.success("Registration successful!");

            this.dispatchEvent(new CustomEvent("register-response", {
                detail: result,
                bubbles: true,
                composed: true
            }));

        } catch (err) {
            console.error("Register error:", err);
        }
    }
}

customElements.define("register-component", RegisterComponent);
