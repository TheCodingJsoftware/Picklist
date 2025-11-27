import { DialogComponent } from "@components/common/dialogs/dialog-component";
import { invertImages, updateMetaColors } from "@utils/theme";

export class AppearanceDialog extends DialogComponent {
    constructor() {
        super({
            id: "appearance-dialog",
            title: "Appearance",
            bodyContent: `<div>
                <div class="row wrap center-align">
                    <label class="radio vertical padding border round">
                        <img class="ignore-invert" src="/static/svgs/light-illustration.svg" width="200px"/>
                        <input type="radio" name="radio-mode" id="light-theme" />
                        <span>Light</span>
                    </label>
                    <label class="radio vertical padding border round">
                        <img class="ignore-invert" src="/static/svgs/dark-illustration.svg" width="200px"/>
                        <input type="radio" name="radio-mode" id="dark-theme" />
                        <span>Dark</span>
                    </label>
                    <label class="radio vertical padding border round">
                        <img class="ignore-invert" src="/static/svgs/auto-illustration.svg" width="200px"/>
                        <input type="radio" name="radio-mode" id="same-as-device" />
                        <span>Automatic</span>
                    </label>
                </div>
            </div>`,
        });
        this.init();
    }

    init() {
        const lightModeButton = this.element.querySelector("#light-theme") as HTMLInputElement;
        lightModeButton.addEventListener("click", () => {
            ui("mode", "light");
            localStorage.setItem("mode", "light")
            invertImages();
            updateMetaColors();
        });

        const darkModeButton = this.element.querySelector("#dark-theme") as HTMLInputElement;
        darkModeButton.addEventListener("click", () => {
            ui("mode", "dark");
            localStorage.setItem("mode", "dark");
            invertImages();
            updateMetaColors();
        });

        const sameAsDeviceButton = this.element.querySelector("#same-as-device") as HTMLInputElement;
        sameAsDeviceButton.addEventListener("click", () => {
            ui("mode", "auto");
            localStorage.setItem("mode", "auto");
            invertImages();
            updateMetaColors();
        });

        const savedMode = localStorage.getItem("mode") || "auto";
        if (savedMode === "auto") {
            sameAsDeviceButton.checked = true;
        } else if (savedMode === "dark") {
            darkModeButton.checked = true;
        } else {
            lightModeButton.checked = true;
        }

        window.addEventListener("resize", this.handleResize);
        this.handleResize()
    }
}