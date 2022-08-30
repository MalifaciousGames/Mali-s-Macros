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

	let link = (this.name === 'but' || this.name === 'butdel') ? $(document.createElement('button')) : $(document.createElement('a')); let passage;
		
// Matches values with attributes
	
	for (let i = 1; i < this.args.length;i+=2) {
		if (this.args[i] === 'goto') { 
			link.attr( 'data-passage' , this.args[i+1] );
			passage = this.args[i+1];
			
// Same processing as the default <<link>> macro
			
			if (Story.has(passage)) {
				link.addClass('link-internal');

				if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
					link.addClass('link-visited');
				}
			} else {
				link.addClass('link-broken');
			}
		} else {
			link.attr( this.args[i] , this.args[i+1] );
		}
	}

	link.wikiWithOptions({ profile : 'core' }, this.args[0]);
	link.addClass(`macro-${this.name}`)
		.ariaClick({
			namespace : '.macros'
		}, 
				
		this.createShadowWrapper(
			this.payload[0].contents !== '' ?
			() => Wikifier.wikifyEval(this.payload[0].contents.trim())
			: null,
			passage != null ?
			() => Engine.play(passage) : 
			(this.name === 'adel' || this.name === 'butdel') ?
			() => link.remove() : null
		))
	.appendTo(this.output);
	}
});
