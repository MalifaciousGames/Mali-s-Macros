
Macro.add('a', {
	isAsync : true,
	tags    : null,

	handler() {
		
// Link is empty

	if (this.args.length === 0) {
		return this.error('No link text specified');
	}
			
// Creates link element

	let link = jQuery(document.createElement('a'));
	
// Assigns properties and values (2 args at a time)
	
	for (let i = 1; i < this.args.length;i+=2) {
		link.attr( this.args[i] , this.args[i+1] );
	}

	link.wikiWithOptions({ profile : 'core' }, this.args[0]);

	link.addClass(`macro-${this.name}`)
		.ariaClick({
			namespace : '.macros',
		}, 
				
		this.createShadowWrapper(
			this.payload[0].contents !== ''
				? () => Wikifier.wikifyEval(this.payload[0].contents.trim())
			: null,
		))
	.appendTo(this.output);
	}
});