// The <<a>> macros, customizable interactive elements

Macro.add(['a','adel','but','butdel'], {
	isAsync : true,
	tags    : null,

	handler() {
		
// Link is empty or number of args is odd

	if (this.args.length === 0) {
		return this.error('No link text specified');
	} else if (this.args.length % 2 != 1) {
		return this.error('Number of arguments must be odd: "link text" + attribute/value pair');
	}
				
// Creates link element

	let link = (this.name === 'but' || this.name === 'butdel') ? $(document.createElement('button')) : $(document.createElement('a'));
	
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
		() => {
			if (this.name === 'adel' || this.name === 'butdel') {
				link.remove();
			}
			Wikifier.wikifyEval(this.payload[0].contents.trim())}
		))
	.appendTo(this.output);
	}
});