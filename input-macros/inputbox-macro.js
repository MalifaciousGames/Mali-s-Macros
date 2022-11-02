/* Maliface's inputbox macro!  

Syntax:

<<inputbox type 'variable' attribute value...>>

...code that runs when 'enter' is pressed...

<<onchange>>

...code that runs whenever the input value is modified...

<</inputbox>>
*/

Macro.add('inputbox', {
	tags: ['onchange'],
	isAsync : true,
	
	handler() {
		const onchange = this.payload.find(pay => pay.name === 'onchange'), onenter = this.payload[0].contents;
		let type = this.args[0], varName = this.args[1], varType, attributes = this.args.slice(2);
			
		// Broad error checks 
		
		if (this.args.length < 2) {
			return this.error(`Missing input type or associated variable`);
		}
		if (typeof type !== 'string') {
			return this.error(`Input type is not a string, reading: "${type}"`);
		} 
		if (typeof varName !== 'string' && !Array.isArray(varName)) {
			//Not a string nor array
			return this.error(`Invalid variable name, reading: "${varName}"`);
		}

			// Setting varType
			if (varName[0] === '$' || varName[0] === '_') {
				varType = 'state';
			} else if (varName.split('.')[0] === 'setup') {
				varType = 'setup';
			} else if (varName.split('.')[0] === 'settings') {
				varType = 'settings';
			} else {
				return this.error(`Unrecognized variable type: "${varName}"`);
			}
			
			// Create input with type
		
			const input = jQuery(document.createElement('input'));
		
			// Applies attribute

			for (let i = 0; i < attributes.length;i+=2) {
				if (typeof attributes[i] === 'object'){
					//JQuery style object
					input.attr(attributes[i]);
					i--;
				} else { // Simple pairs
					input.attr(attributes[i], attributes[i+1]);
				}
			}

			input.attr({
				type : type,
				id : input.attr('id') === undefined ?
					`inputbox-${type}-${Util.slugify(varName)}`
					: input.attr('id'),
				name : input.attr('name') ? input.attr('name') :
					`${type}input-${Util.slugify(varName)}`,
				tabindex : 0})
				.addClass(`macro-inputbox`);
			
			// Check for label property, if found, 
			if (input.attr('label')){
				var label = jQuery(document.createElement('label'))
					.attr('for', input.attr('id'))
					.text(input.attr('label'));
				input.removeAttr('label');
			}
		
		function enforceType(inputValue) {
			const value = isNaN(Number(inputValue))||type === 'text'?
				inputValue : Number(inputValue);
			return value;
		}
		
			$(input).on('input.macros', this.createShadowWrapper(
				function() {
					State.setVar(varName, enforceType(this.value));
					if (varType === 'settings') {
						Setting.save();
					}
					if (onchange != null) {
						$.wiki(onchange.contents);
					}
				}))
			.on('keypress.macros', this.createShadowWrapper(
				function (ev) {
				if (ev.which === 13) { // Enter keycode
					ev.preventDefault();
					State.setVar(varName, enforceType(this.value));
					if (varType === 'settings') {
						Setting.save();
					}
					if (onenter != null) {
						$.wiki(onenter);
					}
					if ($(this).attr('goto')){// To passage
						Engine.play($(this).attr('goto'));
					}
				}
			})
			)
			label ? label.appendTo(this.output) : '' ;
			input.appendTo(this.output);
	}
});