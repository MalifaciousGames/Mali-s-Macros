Macro.add('input', {
	isAsync : true,
	
	handler() {
			
		let varName = this.args[1].trim(),type = this.args[0], value, varType;
			
		if (this.args.length < 2) {
			return this.error('missing input type or associated variable');
		}

		// Ensure that the variable name argument is a string.

		if (typeof this.args[1] !== 'string') {
			return this.error(`variable name "${this.args[1]}" is not a string`);
		}

		// Setting varType
			
		if (varName[0] === '$' || varName[0] === '_') {
			varType = 'state';
		} else if (varName.split('.')[0] === 'setup') {
			varType = 'setup';
		} else if (varName.split('.')[0] === 'settings') {
			varType = 'settings';
		} else {
			return this.error(`unrecognized variable type: "${this.args[1]}"`);
		}
			
		const el  = jQuery(document.createElement('input'));
		// Applies attributes to element

		if (this.args.length % 2 === 0) {
			for (let i = 2; i < this.args.length;i+=2) {
				el.attr( this.args[i] , this.args[i+1] );
			}
		el.attr("type", type);
		} else { 
			return this.error('number of arguments must be even: type $var (attribute value).');
		}

		// Listeners for change/enter
			
		jQuery(el)
			.on('change.macros', this.createShadowWrapper(function () {
				value = isNaN(Number(this.value))||type === 'text'? this.value : Number(this.value);
				State.setVar(varName, value);
				if (varType === 'settings') {
					Setting.save();
				}
			}))
				
			.on('keypress.macros', this.createShadowWrapper(function (ev) {
				if (ev.which === 13) { // Enter keycode
					ev.preventDefault();
					value = isNaN(Number(this.value))||type === 'text'? this.value : Number(this.value);
					State.setVar(varName, value);
					if (varType === 'settings') {
						Setting.save();
					}
				}
			}))
		.appendTo(this.output);
	}
});