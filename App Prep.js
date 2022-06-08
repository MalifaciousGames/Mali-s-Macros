// <<app/prep>> macros

Macro.add(['app', 'prep'], {
	tags  : null,

	handler() {
	
	let target, output;
			
// If number of args is even, throw an error, coming soon, maybe...	
			
	if (this.args.length && this.args.length % 2 != 1) {
		return this.error('Number of arguments must either be odd: selector + (attribute + value)... or 0');
	}
			
// Sets '.passage' as target if args[0] is falsy

	target = (this.args[0]) ? $(this.args[0]) : $('.passage');
			
// Creates span and applies arguments 
			
	output = $(document.createElement('span'));
			
	for (let i = 1; i < this.args.length;i+=2) {
		output.attr( this.args[i] , this.args[i+1] );
	}
				
	output.wiki( this.payload[0].contents );

// Prepend or append
		
	switch (this.name) {
	case 'app':
		target.append(output);
		break;

	case 'prep':
		target.prepend(output);
		break;
	}

// Custom debug view setup.
		
	if (Config.debug) {
		this.debugView.modes({ hidden : true });
	}
	}
});