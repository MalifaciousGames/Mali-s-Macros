/* Update wrapper markup. */
(() => {
	const registry = { next : 0 };
	let isCooldown = false;

	customElements.define(
		'update-wrapper',
		class extends HTMLElement {
			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });
				const view   = document.createElement('span');
				shadow.appendChild(view);
			}

			connectedCallback() {
				const id  = this.getAttribute('data-id');
				const raw = registry[id];
				const val = State.getVar(raw);

				this.updateData = { id, raw, val };
				this.setTextContent(val);
			}

			update() {
				const newVal = State.getVar(this.updateData.raw);

				if (newVal === this.updateData.val) {
					return;
				}

				this.updateData.val = newVal;
				this.setTextContent(newVal);
			}

			disconnectedCallback() {
				delete registry[this.updateData.id];
			}

			setTextContent(val) {
				this.shadowRoot.querySelector('span').textContent = val;
			}
		}
	);

	const processUpdateMarkup = text => {
		return text.replace(/{{(?:.*?}})/g, match => {
			const id = registry.next++;
			registry[id] = match.slice(2, -2).trim();
			return `<update-wrapper data-id="${id}"></update-wrapper>`;
		});
	};

	const updateWrappers = () => $('update-wrapper').each((_, el) => el.update());

	const attachOnProcess = () => {
		if (Config.passages.onProcess) {
			const userFn = Config.passages.onProcess;
			Config.passages.onProcess = p => processUpdateMarkup(userFn(p));
		}
		else {
			Config.passages.onProcess = p => processUpdateMarkup(p.text);
		}
	};

	$(document).on('change click drop refreshUpdateContainers', () => {
		if (isCooldown) {
			return;
		}

		updateWrappers();
		isCooldown = true;
		setTimeout(() => isCooldown = false, 40);
	});

	// Automatically attach a `Config.passages.onProcess` handler
	// while attempting to avoid clobbering a user supplied one.
	$(document).one(':passageinit', attachOnProcess);

	// Exports.
	setup.updateWrappers = updateWrappers;
})();
