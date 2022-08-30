// Customizable elements that update themselves on events
	
Macro.add('on', {
	tags  : null,

	handler() {
		
		if (this.args.length == 0) {
			return this.error('Missing event name');
		} else if (typeof this.args[0] !== 'string'){
			return this.error('Event name must be a string');
		} else if (this.args.length !== 1 && this.args.length % 2 !== 0) {
			return this.error('Number of arguments must be 1 or even: "eventName" + [type] + [attribute + value]');
		}
		
// Split and sort event names
			
		let trig = this.args[0].split(','), content = this.payload[0].contents;
		
		trig = trig.map(event => event.trim());
			
// Create element, apply attributes
		
		let output = $(document.createElement(this.args[1]?this.args[1]:'span')).wiki(content);
			
		for (let i = 2; i < this.args.length;i+=2) {
			output.attr( this.args[i] , this.args[i+1] );
		}
			
		output.addClass(`macro-${this.name}`).appendTo(this.output);
		
// Apply listeners for each event name
		
		for (let i=0;i < trig.length;i++) {
			$(document).on(trig[i], function() {
				output.empty().wiki(content);
				customEvents.pushUnique(trig[i]);
				console.log(trig[1]);
			});
		}
	}
});

// Triggers custom event

Macro.add('trigger', {
	handler() {
			
		let trig = this.args[0].split(',');
		
		trig = trig.map(event => event.trim());
		
// Triggers each event supplied
		
		for (let i=0;i < trig.length;i++) {
			$(document).trigger(trig[i]);
			console.log('Triggered custom event: ' + trig[i]);
		}	
	}
});

// Cleans custom events on passage transition (stops them from stacking endlessly)

	window.customEvents = [];
		
	$(document).on(':passageinit', function () {
		customEvents.forEach(event => $(document).off(event));
		customEvents = [];
	});