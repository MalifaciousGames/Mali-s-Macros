/* Maliface's 'a' macro for Sugarcube

Basic syntax: <<a 'Link text' [goto 'PassageName']>>...link contents...<</a>>

Attributes syntax:
- pairs : <<a 'Text' attribute value...>>>>...link contents...<</a>>
- object : <<a 'Text' `{attribute : value}`>>...link contents...<</a>>

Output options:
<<a 'Text'>>
	...silent code...
<<rep 'selector'>> ...content to replace 'selector' with...
<<prep 'selector'>> ...content to prepend to 'selector'...
<<app 'selector'>> ...content to append to 'selector'...
<</a>>*/

Macro.add(['a','adel','but','butdel'], {
	isAsync : true,
	tags    : ['rep','prep','app'],

	handler() {
		
		const type = (this.name[0] === 'b') ? 'button' : 'link', attributes = this.args.slice(1), payload = this.payload[0].contents.trim();
		const Rep = this.payload.find(pay => pay.name === 'rep'),
					Prep = this.payload.find(pay => pay.name === 'prep'),
					App = this.payload.find(pay => pay.name === 'app');
		
		//Broad errors

		if (this.args.length === 0) {
			return this.error(`No ${type} text specified.`);
		}
		const error = [];
		if (Rep && !Rep.args[0]){
			error.push(`<<rep>>`);
		}
		if (Prep && !Prep.args[0]){
			error.push(`<<prep>>`);
		}
		if (App && !App.args[0]){
			error.push(`<<app>>`);
		}
		if (error.length){
			return this.error(`Invalid selector supplied to ${error.join(', ')}.`);
		}
		
		// Create element

		let link = $(document.createElement(type === 'button'? type : 'a')); 
		
		// Turn argument pairs into attribute/value pairs
	
		for (let i = 0; i < attributes.length;i+=2) {
			if (typeof attributes[i] === 'object'){// jquery style object
				link.attr(attributes[i]);
				i--;
			} else { //Simple pair
				link.attr( attributes[i], attributes[i+1]);
			}
		}
		
		// Process special args
		if (link.attr('goto')){
			var passage = link.attr('goto');
			link.removeAttr('goto');
			// Default link processing
			if (Story.has(passage)) {
				link.addClass('link-internal');
				if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
					link.addClass('link-visited');
				}
			} else {
				link.addClass('link-broken');
			}
		}
		
		//Doesn't take special link syntax so core profile it is
		link.wikiWithOptions({ profile : 'core' }, this.args[0])
			.addClass(`macro-${this.name}`);
		
		link.ariaClick({
				namespace : '.macros',
				role : type ,
				one : (this.name.length > 3 || passage !== undefined) ? true : false},
			this.createShadowWrapper( function() {
				$.wiki(payload);
					
				Rep ? $(Rep.args[0]).empty().wiki(Rep.contents) : null ;
				Prep ? $(document.createDocumentFragment())
								.wiki(Prep.contents).prependTo(Prep.args[0]) : null ;
				App ? $(App.args[0]).wiki(App.contents) : null ;
			}, () => {
				if (passage != null){ //Go to passage
					Engine.play(passage)
				} else if (this.name.length > 3){ //Remove link
					link.remove()
				}
		})).appendTo(this.output);
	}
});
