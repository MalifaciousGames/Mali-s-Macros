(() => {
let registry = {count : 0}, cooldown = false;

customElements.define(
	'update-wrapper',
  	class extends HTMLElement {
		constructor() {
    		super();
  		}
  		connectedCallback() {
        	const id = this.getAttribute('data-id'), raw = registry[id], val = State.getVar(raw);
			this.innerText = val;
          	this.updateData = {raw : raw, val : val};
  		}
      	update() {
        	const newVal = State.getVar(this.updateData.raw);
          	if (newVal === this.updateData.val) return;
          	this.innerText = this.updateData.val = newVal;
        }
  		disconnectedCallback() {
          	delete registry[this.getAttribute('data-id')];
  		}
	}
);

setup.updateWrappers = () => {
	$('update-wrapper').each((i,e) => e.update());
};

setup.processUpdateMarkup = (txt) => {
	return txt.replace(/{{(?:.*?}})/g, m => {
      	const id = registry.count++;
      	registry[id] = m.slice(2,-2).trim();
    	return `<update-wrapper data-id=${id}></update-wrapper>`;
    });
};
  
$(document).on('change click drop refreshUpdateContainers', e => {
  	if (cooldown) return;
	setup.updateWrappers();
  	cooldown = true;
  	setTimeout(e => {cooldown = false}, 40);
});
})();

Config.passages.onProcess = (p) => {
	/* For the update markup to work, passage text has to go through the setup.processUpdateMarkup() function */
  	return setup.processUpdateMarkup(p.text);
};
