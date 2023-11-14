/* Update wrapper markup. */
(() => {
    let isCooldown = false;
    const shadowHandler = Wikifier.helpers.shadowHandler || Wikifier.helpers.createShadowSetterCallback; //version check

    customElements.define(
        'update-wrapper',
        class extends HTMLElement {
            constructor() {
                super();

                const shadow = this.attachShadow({
                    mode: 'open'
                });
                const view = document.createElement('span');
                shadow.appendChild(view);
            }

            connectedCallback() {
                this.setTextContent();
            }

            update() {
                const newVal = stringFrom(this.getShadowValue());
                if (newVal === this.previousValue) {
                    return;
                }
                this.previousValue = newVal;
                this.setTextContent();
            }

            setTextContent(val) {
                this.shadowRoot.querySelector('span').textContent = val ?? stringFrom(this.getShadowValue());
            }
        }
    );

    const updateWrappers = () => $('update-wrapper').each((_, el) => el.update());

    Wikifier.Parser.add({
        name: 'updateMarkup',
        match: '{{(?:.*?}})',

        handler(w) {
            const raw = w.matchText.slice(2, -2).trim(),
                $wrp = $(`<update-wrapper>`).get(0);
            $wrp.getShadowValue = shadowHandler(`State.getVar("${raw}")`);
            w.output.append($wrp);
        }
    });

    $(document).on('change click drop refreshUpdateContainers', () => {
        if (isCooldown) {
            return;
        }

        updateWrappers();
        isCooldown = true;
        setTimeout(() => isCooldown = false, 40);
    });

    // Exports.
    setup.updateWrappers = updateWrappers;
})();
