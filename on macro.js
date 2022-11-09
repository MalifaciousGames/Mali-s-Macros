/* Maliface's <<on>> macro, customizable element which updates on event.

Syntax:
<<on 'eventName' 'elementType' [attribute + value] [`{ attribute : value }`]>>
...contents...
<</on>>

To run the contents again (update it):
<<trigger 'eventName'>>
*/
	
Macro.add('on', {
	tags  : null,

	handler() {
		
		if (typeof this.args[0] !== 'string'){
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		} else if (this.args[0].length === 0) {
			return this.error(`Missing event name.`);
		}
		
		// Event names to array + trim white spaces

		let trig = this.args[0].split(',');
		trig = trig.map(event => event.trim());
		
		const content = this.payload[0].contents, attributes = this.args.slice(2);
			
		// Create element, apply attributes
		
		let container = $(document.createElement(this.args[1] ? this.args[1] : 'span')).addClass(`macro-${this.name}`);
			
		for (let i = 0; i < attributes.length;i+=2) {
			if (typeof attributes[i] === 'object'){
				//JQuery style object
				container.attr(attributes[i]);
				i--;
			} else { // Simple pairs
				container.attr(attributes[i], attributes[i+1]);
			}
		}
			
		// Append to passage 
		container.wiki(content).appendTo(this.output);
		
		// Apply listeners for each event name
		
		trig.forEach(event => {
			if (Config.debug) {
				console.log(`Listener added for ${event}.`);
			}
			$(document).on(event, function() {
				container.empty().wiki(content);
				customEvents.pushUnique(event);
			});
		})
	}
});

// Triggers custom events

Macro.add('trigger', {
	handler() {
		
		if (typeof this.args[0] !== 'string'){
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		} else if (this.args[0].length === 0) {
			return this.error(`Missing event name.`);
		}
		
		// Same processing
		let trig = this.args[0].split(',');
		trig = trig.map(event => event.trim());
		
		// Triggers each supplied event
		
		trig.forEach(event => {
			$(document).trigger(event);
			if (Config.debug) {
				console.log(`Triggered custom event: ${event}.`);
			}
		})
	}
});

// Cleans custom events on passage transition (stops them from stacking)

window.customEvents = [];
		
$(document).on(':passageinit', function () {
	customEvents.forEach(event => $(document).off(event));
	customEvents = [];
});
