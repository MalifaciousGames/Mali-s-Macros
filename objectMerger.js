Macro.add('newitem', {
	
	handler() {
			
		if (this.args.length === 0){ return this.error(`No argument supplied, <<item>> needs at least a name to function.`);}
			
		let newObj = {}, name = this.args[0];
		
		if (typeof name  !== 'string'){ return this.error(`The object name must be a string. Currently: ${typeof name}.`);}
			
			//Loop through supplied objects, assigning their properties to newObj
			
		for (let i = 1;i < this.args.length;i++){
			if (typeof this.args[i] === 'object'){
				Object.assign(newObj, this.args[i]);
			} else {
				return this.error(`'${this.args[i]}' is not an object nor can it be parsed into one.`);
			}
		}
			
		let reference = name.split('.');
			
		if (reference.length > 1){
			//Reference has dots in it (setup.variable)...
			switch(reference[0]){
				case 'setup': setup[reference.slice(-1)] = clone(newObj);
				break;
				case 'settings': settings[reference.slice(-1)] = clone(newObj);	Setting.save();
				break;
				case 'State': State.setVar(name, clone(newObj));
				break;
				default: 
				return this.error(`Invalid or unsupported namespace: '${name}'.`);
			}
		} else {
			//Reference is a single block ($variable)...
			switch(name[0]){
				case '$': case '_': State.setVar(name, clone(newObj));
				break;
				default: return this.error(`'${name}' is missing a sigil.`);
			}
		}
	}
});