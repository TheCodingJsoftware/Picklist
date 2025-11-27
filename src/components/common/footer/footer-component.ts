export class FooterComponent extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
        <footer>
            <p class="center-align">For questions, comments, or concerns about this service, please email <a class="underline link" href="mailto:jared@hbni.net">jared@hbni.net</a></p>
        </footer>
        `;
    }
}

customElements.define("footer-component", FooterComponent);
