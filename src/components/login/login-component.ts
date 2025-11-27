import { SnackbarComponent } from "@components/common/snackbar/snackbar";

export class LoginComponent extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
        <div class="padding">
            <div class="round field label border bottom-margin">
                <input type="text" id="username">
                <label>Username</label>
            </div>

            <div class="round field label border bottom-margin">
                <input type="password" id="password">
                <label>Password</label>
            </div>

            <nav class="right-align">
                <button id="login-btn">
                    <i>login</i>
                    <span>Login</span>
                </button>
            </nav>

        </div>
        `;
    }

    connectedCallback() {
        const body = document.querySelector("body");
        const colony = body?.getAttribute("data-colony");

        this.querySelector("#login-btn")!.addEventListener("click", async () => {
            const username = (this.querySelector("#username") as HTMLInputElement).value;
            const password = (this.querySelector("#password") as HTMLInputElement).value;

            const form = new FormData();
            form.append("username", username);
            form.append("password", password);

            const res = await fetch(`/${colony}/login`, {
                method: "POST",
                body: form
            });

            const json = await res.json();

            if (json.success) {
                SnackbarComponent.success("Logged in!");
                window.setTimeout(() => {
                    window.location.href = `/${colony}`;
                }, 1000);
            } else {
                SnackbarComponent.error("Invalid username or password");
            }
        });
    }
}

customElements.define("login-component", LoginComponent);
