Macro.add('input', {
	isAsync : true,
	
	handler() {
			
		let varName = this.args[1].trim(),type = this.args[0], value;
			
		if (this.args.length < 2) {
			return this.error('missing input type or associated variable');
		}

// Ensure that the variable name argument is a string.

		if (typeof this.args[1] !== 'string') {
			return this.error(`variable name "${this.args[0]}" is not a string`);
		}

// Try to ensure that we receive the variable's name (incl. sigil), not its value.
			
		if (varName[0] !== '$' && varName[0] !== '_') {
			return this.error(`variable name "${this.args[0]}" is missing its sigil ($ or _)`);
		}

// Creates input element, applies attributes

		const el  = jQuery(document.createElement('input'));


		if (this.args.length % 2 === 0) {
			for (let i = 2; i < this.args.length;i+=2) {
				el.attr( this.args[i] , this.args[i+1] );
			}
			el.attr("type", type);
		} else { 
			return this.error('Number of arguments must be an even number: type $var (attribute value).');
		}

// Listeners for change/enter
			
		jQuery(el)
			.on('change.macros', this.createShadowWrapper(function () {
				value = isNaN(Number(this.value))||type === 'text'? this.value : Number(this.value);
				State.setVar(varName, value);
			}))
			
			.on('keypress.macros', this.createShadowWrapper(function (ev) {
				if (ev.which === 13) { // Enter keycode
					ev.preventDefault();
					value = isNaN(Number(this.value))||type === 'text'? this.value : Number(this.value);
					State.setVar(varName, value);
				}
			}))
		.appendTo(this.output);
	}
});