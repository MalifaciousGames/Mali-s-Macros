/* Maliface's <<on>> macro, customizable element which updates on event.
Syntax:
<<on 'eventName' 'elementType' [attribute + value] [`{ attribute : value }`]>>
...contents...
<</on>>
To run the contents again (update it):
<<trigger 'eventName'>> */
	
Macro.add('on', {
	tags  : null,

	handler() {
		
		if (!this.args[0]) {
			return this.error(`Missing event name.`);
		} else if (typeof this.args[0] !== 'string'){
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		}
		
		let trig = this.args[0].split(','), onInit = true;
		const content = this.payload[0].contents, attributes = this.args.slice(2);
		trig = trig.map(event => event.trim());
			
		// Create element, apply attributes
		let container = $(document.createElement(this.args[1] ?? 'span')).addClass(`macro-${this.name}`);
			
		for (let i = 0; i < attributes.length;i++) {
			if (typeof attributes[i] === 'object'){//JQuery style object
				container.attr(attributes[i]);
			} else { // Simple pairs
				container.attr(attributes[i], attributes[i+1]);
				i++;
			}
		}
		
		if (container.attr('onInit') !== undefined){
			onInit = eval(container.attr('onInit'));
			container.removeAttr('onInit').attr('data-onInit', onInit);
		}

		// Apply listener for each event name
		trig.forEach(event => {
			if (Config.debug) {
				console.log(`Listener added for ${event}.`);
			}
			customEvents.pushUnique(event);
			$(document).on(event, function() {
				container.empty().wiki(content);
			});
		})
		// Wikify on passage load, unless onInit is false
		onInit ? container.wiki(content) : null;
		container.appendTo(this.output);
	}
});

// Triggers custom event

Macro.add('trigger', {
	handler() {
		
		if (this.args[0] === undefined || this.args[0] === '') {
			return this.error(`Missing event name.`);
		} else if (typeof this.args[0] !== 'string'){
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		}
		
		let trig = this.args[0].split(',');
		trig = trig.map(event => event.trim());
		
		// Triggers each event supplied
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