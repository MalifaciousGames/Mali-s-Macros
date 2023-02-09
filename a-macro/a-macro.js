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
	
		const type = this.name[0] === 'b' ? 'button' : 'link',
			attributes = this.args.slice(1),
			payload = this.payload[0].contents;
      
		const Rep = this.payload.find(pay => pay.name === 'rep'),
			Prep = this.payload.find(pay => pay.name === 'prep'),
			App = this.payload.find(pay => pay.name === 'app');
      	
      		let oldThis;
      
		// Create element
		let link = $(document.createElement(type === 'button'? type : 'a')); 
		
		// Catch trigger property
      		if (attributes.includes('trigger')){
			var trig = attributes.deleteAt([attributes.indexOf('trigger')+1])[0].split(',');
			trig = trig.map(e => e.trim());
			attributes.delete('trigger');
		};
      
      		// Catch goto property
		if (attributes.includes('goto')){
			var passage = attributes.deleteAt([attributes.indexOf('goto')+1])[0];
			attributes.delete('goto');
		};
      	
      		// Catch key property
		if (attributes.includes('key')){
			var keyArray = attributes.deleteAt([attributes.indexOf('key')+1])[0].split(',');
          	console.log(keyArray)
			attributes.delete('key');
		};
      
		// Turn argument pairs into html property/value pairs
		for (let i = 0; i < attributes.length;i++) {
			if (typeof attributes[i] === 'object'){// jQuery style object
				link.attr(attributes[i]);
			} else { //Simple pairs
				link.attr( attributes[i], attributes[i+1]);
				i++;
			}
		};
      	
      		// Process passage links like SC's link macro would
      		if (passage) {
        		link.attr('data-passage', passage);
        		if (Story.has(passage)) {
				link.addClass('link-internal');
				if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
					link.addClass('link-visited');
				}
			} else {
				link.addClass('link-broken');
			}
		};

     
		// Attach key listeners
		if (keyArray){
			// Event handler
			$(document).keyup((e) => {
				keyArray.every(key => {
					if (e[isNaN(Number(key)) ? 'key' : 'keyCode'] == key){
						e.preventDefault();
						link.click();
						return false; //Stops the every()
						//Makes sure it runs only once even if redundant keys are given
					}
					return true;
				})
			})
		};
		
      		// Wiki link text
		link.wikiWithOptions({ profile : 'core' }, this.args[0]).addClass(`macro-${this.name}`);
      
		link.ariaClick( //Options object
			{namespace : '.macros',
			role : type ,
			one : (this.name.length > 3 || passage !== undefined) ? true : false},            
			this.createShadowWrapper(
				() => { // Main call
          			console.log('Click ran');
        			oldThis = State.temporary.hasOwnProperty('this') ? State.temporary.this : null; 
           			State.temporary.this = link;
        	
        			payload ? $.wiki(payload) : null;
					Rep ? $(Rep.args[0] ?? link.parent()).empty().wiki(Rep.contents) : null ;
					Prep ? $(document.createDocumentFragment()).wiki(Prep.contents).prependTo(Prep.args[0] ?? link.parent()) : null ;
					App ? $(App.args[0]  ?? link.parent()).wiki(App.contents) : null ;
					trig ? trig.forEach(e => {$(document).trigger(e)}) : null ;
				},
				() => { // After call
        			console.log('After ran');
	    			oldThis !== null ? State.temporary.this = oldThis : delete State.temporary.this; // _this cleanup
           			if (passage){ //Go to passage
						Engine.play(passage);
					} else if (this.name.length > 3){ //Remove link
						link.remove();
					}
				}
			)
		).appendTo(this.output);
	}
});
