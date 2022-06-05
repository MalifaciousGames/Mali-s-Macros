// Event macro, does updating if given a selector as second arg

Macro.add('on', {
	tags  : null,

	handler() {
		
		if (this.args.length == 0) {
			return this.error('Missing arguments');
		}
		
		let target;
		let content = this.payload[0].contents;
		
// Event name
		
		let trig = this.args[0];
			
// Use second arg as target, if given
			
		target = (this.args[1]) ? $(this.args[1]) : null ;
		
		$(document).on(trig, function(e) {
			
			if (target && target.length != 0) {
// Append wikified code to target
				$(target).empty();
				new Wikifier(target, content);
			} else {
// If no target is given/found, just run the code
				new Wikifier(null, content);
			}
		});
	}
});

// Triggers custom event

Macro.add('trigger', {
		handler() {
			
		let trig = this.args[0];
		
		$(document).trigger(trig);
	}
});