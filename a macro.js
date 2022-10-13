// The <<a>> macros, customizable interactive elements
//Special properties: goto , rep/replace , prep/prepend , app/append


Macro.add(['a','adel','but','butdel'], {
	isAsync : true,
	tags    : null,

	handler() {
		
		let passage, toApp = [], toRep = [], toPrep = []; 
		const payload = this.payload[0].contents.trim();
		
		// Link is empty or number of args is odd

		if (this.args.length === 0) {
			return this.error('No link text specified');
		} else if (this.args.length % 2 != 1) {
			return this.error('Number of arguments must be odd: "link text" + attribute/value pair');
		}
				
		// Create element

		let link = (this.name === 'but' || this.name === 'butdel') ? $(document.createElement('button')) : $(document.createElement('a')); 
		
		// Turn argument pairs into attribute/value pairs
	
		for (let i = 1; i < this.args.length;i+=2) {
			//'goto' makes a passage link, same processing as default SC
			if (this.args[i] === 'goto') { 
				link.attr( 'data-passage' , this.args[i+1] );
				passage = this.args[i+1];
				
				if (Story.has(passage)) {
					link.addClass('link-internal');

					if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
						link.addClass('link-visited');
					}
				} else {
					link.addClass('link-broken');
				}
			//Check for other special args
			} else if (this.args[i] === 'append' || this.args[i] === 'app'){
			
				toApp.push(this.args[i+1]);
			
			} else if (this.args[i] === 'prepend' || this.args[i] === 'prep'){
			
				toPrep.push(this.args[i+1]);
			
			} else if (this.args[i] === 'replace' || this.args[i] === 'rep'){
			
				toRep.push(this.args[i+1]);
			
			} else {
				link.attr( this.args[i] , this.args[i+1] );
			}
		}
		
		//Doesn't take special link syntax so core profile it is
		link.wikiWithOptions({ profile : 'core' }, this.args[0]);
		link.addClass(`macro-${this.name}`)
			.ariaClick({
				namespace : '.macros',
				role : (this.name === 'but' || this.name === 'butdel') ? 'button' : 'link',
				one : (this.name === 'adel' || this.name === 'butdel' || passage != null) ? true : false
			}, 
				
			this.createShadowWrapper(
		
				() => {
					if (payload !== ''){
						//Order: replace, prepend, append
						toRep.length ? toRep.forEach((target) => {
							$(target).empty().wiki(payload)
						}) : '';
						toPrep.length ? toPrep.forEach((target) => {
							$(document.createDocumentFragment()).wiki(payload).prependTo(target);
						}) : '';
						toApp.length ? toApp.forEach((target) => {
							$(target).wiki(payload)
						}) : '';
						
						//Default case
						$.wiki(payload);
					}
				},
			
				passage != null ?
				() => Engine.play(passage) : 
				(this.name === 'adel' || this.name === 'butdel') ?
				() => link.remove() : null
			))
		.appendTo(this.output);
	}
});
