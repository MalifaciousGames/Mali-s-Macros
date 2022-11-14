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
		Rep && !Rep.args[0] ? error.push(`<<rep>>`) : null;
		Prep && !Prep.args[0] ? error.push(`<<prep>>`) : null;
		App && !App.args[0] ? error.push(`<<app>>`) : null;
		
		if (error.length){
			return this.error(`Invalid selector supplied to ${error.join(', ')}.`);
		}
		
		// Create element

		let link = $(document.createElement(type === 'button'? type : 'a')); 
		
		// Turn argument pairs into attribute/value pairs
		for (let i = 0; i < attributes.length;i+=2) {
			if (typeof attributes[i] === 'object'){// jQuery style object
				link.attr(attributes[i]);
				i--;
			} else { //Simple pair
				link.attr( attributes[i], attributes[i+1]);
			}
		}
		
		//Built-in event trigger
		if (link.attr('trigger')){
			var trig = link.attr('trigger').split(',');
			trig = trig.map(event => event.trim());
			link.removeAttr('trigger');
		}
								 
		// Goto attribute
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
		
		// Key attribute
		if (link.attr('key')){
			const key = link.attr('key').toUpperFirst(),
				keyType = (isNaN(Number(key))) ? 'key' : 'keyCode';
			
			$(document).on('keyup', function(e) {
				if (e[keyType] == key){
					e.preventDefault();
					link.click();
					return false;
				}
			})
		}
		
		//Doesn't take special link syntax so core profile it is
		link.wikiWithOptions({ profile : 'core' }, this.args[0])
			.addClass(`macro-${this.name}`);
		
		link.ariaClick({
				namespace : '.macros',
				role : type ,
				one : (this.name.length > 3 || passage !== undefined) ? true : false},
			this.createShadowWrapper( function() {
				payload ? $.wiki(payload) : null ;
				Rep ? $(Rep.args[0]).empty().wiki(Rep.contents) : null ;
				Prep ? $(document.createDocumentFragment())
								.wiki(Prep.contents).prependTo(Prep.args[0]) : null ;
				App ? $(App.args[0]).wiki(App.contents) : null ;
				trig ? trig.forEach(event => {$(document).trigger(event)})  : null ;
			}, () => {
				if (passage != null){ //Go to passage
					Engine.play(passage)
				} else if (this.name.length > 3){ //Remove link
					link.remove()
				}							 
			})).appendTo(this.output);
	}
});
