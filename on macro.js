// Updates code block on custom event

Macro.add('on', {
	tags  : null,

	handler() {
		
		if (this.args.length == 0) {
			return this.error('missing event name');
		} else if (typeof this.args[0] !== 'string'){
			return this.error('event name must be a string');
		}

		let content = this.payload[0].contents, output;
		
// Custom event name
		
		let trig = this.args[0];
			
		output = $(document.createElement('span')).wiki(content).appendTo(this.output);
		
		$(document).on(trig, function(e) {
			output.empty().wiki(content);
		});
	}
});

// Triggers custom event

Macro.add('trigger', {
		handler() {
		let trig = this.args[0];
		$(document).trigger(trig);
	}
});dding:0}