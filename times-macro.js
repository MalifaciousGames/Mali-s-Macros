/*<<times x ['iterationVariable']>>...code to run x number of times...<</times>>*/
 
Macro.add('times', {
	tags : null,

	handler() {
	
		const num = this.args[0], 
					payload = this.payload[0].contents,
					varName = this.args[1] ? this.args[1].trim() : '_i',
					oldValue = State.getVar(varName);
		
		if (typeof num !== 'number'){
			return this.error(`Number of iterations must be a number, reading:'${typeof num}'`);
		}
		
		try { //Run loop
			for (let i = 0; i < num; i++){
				State.setVar(varName , i);
				payload ? $(this.output).wiki(payload) : null;
			}
		} finally { //Value clean up
			//The wikifier call feels wasteful but it saves on having to copy 
			//a bunch of <<unset>> code...
			oldValue === undefined ?
				$.wiki(`<<unset ${varName}>>`) :
				State.setVar(varName , oldValue);
		}
	}
});
