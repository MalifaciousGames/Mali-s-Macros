// Updates code block on custom event
	
Macro.add('on', {
	tags  : null,

	handler() {
		
		if (this.args.length == 0) {
			return this.error('missing event name');
		} else if (typeof this.args[0] !== 'string'){
			return this.error('event name must be a string');
		}
		
		let trig = this.args[0].split(','), content = this.payload[0].contents, output;
		
		trig = trig.map(event => event.trim());
		
		// Passage load:
		output = $(document.createElement('span')).wiki(content);
		output.addClass(`macro-${this.name}`).appendTo(this.output);
		
		// On custom event:
		
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