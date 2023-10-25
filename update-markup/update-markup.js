(() => {
let registry = {count : 0}, cooldown = false;

customElements.define(
	'update-wrapper',
  	class extends HTMLSpanElement {
		constructor() {
    		super();
  		}
  		connectedCallback() {
        	const id = parseInt(this.getAttribute('data-id')), raw = registry[id], val = State.getVar(raw);
			$(this).empty().wiki(val);
          	this.updateData = {id : id, raw : raw, val : val};
  		}
      	update() {
        	const newVal = State.getVar(this.updateData.raw), oldVal = this.updateData.val;
          	if (newVal === oldVal) return;
          	$(this).empty().wiki(this.updateData.val = newVal);
        }
  		disconnectedCallback() {
          	delete registry[this.updateData.id];
  		}
	},
  {extends: 'span'}
);

setup.updateWrappers = () => {
	$('[is="update-wrapper"]').each((i,e) => e.update());
};

setup.processUpdateMarkup = (txt) => {
	return txt.replace(/{{(?:.*?}})/g, m => {
      	const id = registry.count++;
      	registry[id] = m.slice(2,-2).trim();
    	return `<span is=update-wrapper data-id=${id}></span>`;
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
