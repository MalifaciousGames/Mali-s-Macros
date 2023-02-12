/* Maliface's <<on>> macro, customizable element which updates on event.
Syntax:
<<on 'eventName' 'elementType' [attribute + value] [`{ attribute : value }`]>>
...contents...
<</on>>
To run the contents again (update it):
<<trigger 'eventName'>> */

(function() {

setup.on_macro_events = [];

//Clean listeners on passage transition to avoid stacking !
$(document).on(':passageinit', function () {
	setup.on_macro_events.forEach(event => $(document).off(event));
	setup.on_macro_events = [];
});

Macro.add('on', {
	tags  : null,

	handler() {
		
		if (!this.args[0]) {
			return this.error(`Missing event type.`);
		} else if (typeof this.args[0] !== 'string'){
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		};
        
		const trig = this.args[0].split(',').map(event => event.trim()),
        		content = this.payload[0].contents,
            		attributes = this.args.slice(2);
      		let onInit;
      
		// Create element, apply attributes
		let container = $(document.createElement(this.args[1] || 'span'));
		
      		if (attributes.includes('onInit')){
        		onInit = eval(attributes.deleteAt(attributes.indexOf('onInit')+1)[0]);
          		attributes.delete('onInit');
		} else {
        		onInit = true;
		};
      
		for (let i = 0; i < attributes.length;i++) {
			if (typeof attributes[i] === 'object'){//JQuery style object
				container.attr(attributes[i]);
			} else { // Simple pairs
				container.attr(attributes[i], attributes[i+1]);
				i++;
			}
		};

		// Apply listener for each event name
		trig.forEach(event => {
			setup.on_macro_events.pushUnique(event);
			$(document).on(event, function() {
				container.empty().wiki(content);
			});
		});
      
		// Wikify on passage load, unless onInit is false
		container.addClass(`macro-${this.name}`).wiki(onInit ? content : '').appendTo(this.output);
	}
});

// Triggers custom events

Macro.add('trigger', {
	handler() {
		
      		let trig = this.args[0];
      
		if (!['string','object'].includes(typeof trig)) {
			return this.error(`Invalid event type, reading :'${typeof trig}'.`);
		}
		
		if (typeof trig === 'string'){ //Comma-separated string of events
			trig = trig.split(',').map(event => event.trim());
		} else if (typeof trig === 'object' && !Array.isArray(trig)){ //A single event object
        		trig = [trig];
        	}//Do nothing if trig is already an array, it's fine

		// Triggers each event supplied
		trig.forEach(event => {
			$(this.args[1] ?? document).trigger(event);
		});
	}
});
})();
