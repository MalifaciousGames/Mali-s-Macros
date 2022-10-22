Macro.add(['addtoggle','addlist','addrange'], {
	tags : ['label', 'payload','desc','list','range'],
	
	handler() {
	
		// Common variables:
		const name = this.args[0], label = this.payload.find(pay => pay.name === 'label');
		let desc = this.payload.find(pay => pay.name === 'desc'), value = this.args[1];
		let payload = this.payload.find(pay => pay.name === 'payload');
		
		// Common errors:
		if (name == null){
			return this.error('New setting needs a name.');
		} else if (label.args[0] == null){
			return this.error(`New setting ${name} needs a label.`);
		} else if (payload.contents == null){
			return this.error(`New setting ${name} needs a code payload.`);
		}
		
		console.log(typeof value)
		
		// If description is available, set it
		if (desc !== undefined){ desc = desc.args[0]};
		
		/* Process paylod to make _this a thing, cannot use a proper temp variable since the State doesn't exist when these are loaded, the _this syntax aims to be consistent with widgets */
		
		const ChangePayload = payload.contents.replaceAll('_this', 'settings.'+name);
		
		// SC code treated as onChange function
		
		const onChange = function () {
			$.wiki(ChangePayload);
		}
		
		// Custom content
		switch (this.name) {
			case 'addtoggle':
				
				if (value !== undefined && typeof value !== "boolean"){
					return this.error(`New setting ${name}: Default toggle value must be a boolean (currently '${typeof value}').`);
				}
				
				Setting.addToggle(name, {
					label    : label.args[0],
					default  : value,
					onChange : onChange,
					desc: desc
				});
			break;
				
			case 'addlist':	
				
				const list = this.payload.find(pay => pay.name === 'list');
				if (list == null) {
					return this.error(`New setting ${name}: List setting is missing a list of options.`);
				} else if (!Array.isArray(list.args[0])){
					return this.error(`New setting ${name}: The list supplied must be an  array.`);
				} else if (value !== undefined && !list.args[0].includes(value)){
					return this.error(`New setting ${name}: default value must be a member of the list array.`);
				}
		
				Setting.addList(name, {
					label   : label.args[0],
					list    : list.args[0],
					default  : value,
					onChange : onChange,
					desc: desc
				});
			break;
				
			case 'addrange':
				const range = this.payload.find(pay => pay.name === 'range');
				const min = range.args[0], max = range.args[1], step = range.args[2];
					
				if (range.length < 3){
					return this.error(`New setting ${name}: The range argument must include min, max and step values.`);
				} else if (range.args.filter(num => typeof num !== 'number').length){
					return this.error(`New setting ${name}: Ranges values must all be numbers.`);
				} else if (value !== undefined && typeof value !== 'number'){
					return this.error(`New setting ${name}: Default value must be a number (currently '${typeof value}').`);
				}
				
				Setting.addRange(name, {
					label    : label.args[0],
					min      : min,
					max      : max,
					step     : step,
					onChange : onChange,
					desc : desc
				});
					
			break;
		};
		
		// Corresponding settings object already exists, run that
		if (settings[name] !== undefined) {
			value = settings[name];
		} 
			
		// Since paylaod's already a string, string syntax needs to be enforced 
		if (typeof value === 'string') {
			value = `'${value}'`;
		}
		
		const initPayload = payload.contents.replaceAll('_this', value);
			
		//Runs once on startup, once 'late' html is generated
		$(document).one(':passagerender', function() {
			$.wiki(initPayload);
		});
	}
});
