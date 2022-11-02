/* Maliface's input macro!  

Variable syntax:
- single variable : <<input type 'variable'>>
- array: <<input type `['var1','var2','var3']`>> -> generates 3 input elements

Attributes syntax:
- pairs : <<input type 'var' attribute value...>>
- object : <<input type 'var' `{attribute : value}`>>

Differencial attributes:
<<input type `['var1','var2','var3']` attribute `[value1, value2, value3]`>> -> values are assigned to their corresponding element
*/

Macro.add('input', {
	isAsync : true,
	
	handler() {
			
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
		
		// Sensible data type based on input type
		
		function enforceType(inputValue) {
			const value = isNaN(Number(inputValue))||type === 'text'?
				inputValue : Number(inputValue);
			return value;
		}
		
		function inputBuilder(varkey, index) {
			
			if (varkey[0] === '$' || varkey[0] === '_') {
				varType = 'state';
			} else if (varkey.split('.')[0] === 'setup') {
				varType = 'setup';
			} else if (varkey.split('.')[0] === 'settings') {
				varType = 'settings';
			} else {
				throw new Error(`Unrecognized variable type: "${varName}"`);
			}
			
			const input = jQuery(document.createElement('input'));
		
			// Applies attribute

			for (let i = 0; i < attributes.length;i+=2) {

				if (Array.isArray(attributes[i+1]) && index !== undefined){
					//The array of vars is supplied with an attribute array
					if (varName.length !== attributes[i+1].length) {
						throw new Error(`Attribute values array must be the same length as variables array: [${varName}] !== [${attributes[i+1]}]`);
					} else { //Match by index
						input.attr(attributes[i], attributes[i+1][index]);
					}
				} else if (typeof attributes[i] === 'object'){
					//JQuery style object
					input.attr(attributes[i]);
					i--;
				} else { // Simple pairs
					input.attr(attributes[i], attributes[i+1]);
				}
			}
			
			// ID setter
			if (index !== undefined){ //Multi outputs
				
				if (input.attr('id') === undefined){
					// No supplied id
					var id = `${type}input-${Util.slugify(varkey)}-${index}`;
				} else {
					//Add index to custom id
					var id = `${input.attr('id')}-${index}`;
				}
				
			} else { //Single output
				var id = input.attr('id') === undefined ?
								`input-${type}-${Util.slugify(varkey)}` :
								input.attr('id');
			}
			
			input.attr({
				type : type,
				id : id ,
				name : input.attr('name') ? input.attr('name') :
					`${type}input-${Util.slugify(varkey)}`,
				tabindex : 0})
				.addClass(`macro-input`);
			
			// Attached label if needed
			if (input.attr('label')){
				var label = jQuery(document.createElement('label'))
					.attr('for', input.attr('id'))
					.text(input.attr('label'));
				input.removeAttr('label');
			}

			jQuery(input).on('change.macros', function() {
				State.setVar(varkey, enforceType(this.value));
				if (varType === 'settings') {
					Setting.save();
				}
			})
			.on('keypress.macros', function (ev) {
				if (ev.which === 13) { // Enter keycode
					ev.preventDefault();
					State.setVar(varkey, enforceType(this.value));
					if (varType === 'settings') {
						Setting.save();
					}
					if ($(this).attr('goto')){// To passage
						Engine.play($(this).attr('goto'));
					}
				}
			});

			return [ label , input ];
		}
		
		// Output to passage
		if (Array.isArray(varName)){
			for (let i = 0; i < varName.length;i++){
				inputBuilder(varName[i].trim(), i).forEach(elem => { elem ? elem.appendTo(this.output) : '' });
			}
		} else {
			inputBuilder(varName.trim()).forEach(elem => { elem ? elem.appendTo(this.output) : '' });
		}
	}
});