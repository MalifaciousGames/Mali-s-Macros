Macro.add('toggle', {
	tags : ['case','all'],
	
	handler () {
		
		const varName = this.args[0], type = this.args[1], attributes = this.args.slice(2);
		const commonCode = this.payload.find(pay => pay.name === 'all');
		let caseArray = [];
		
		//Return errors!
		if (varName === undefined)
			return this.error(`Toggle macro must be supplied with a variable: <<toggle '$variable'>>.`);
		if (varName && typeof varName !== 'string')
			return this.error(`Variable name needs to be a string, reading : '${typeof varName}'`);
		if (type && !['link','button'].includes(type))
			return this.error(`Element type must be either 'link' or 'button', reading : '${type}'`);
		
		//Push 'case' tags content to caseArray
		this.payload.forEach(pay => {
			if (pay.name === 'case'){
				caseArray.push(pay);
			}
		})
		
		if (caseArray.length < 2)
			return this.error(`Toggle macro should have at least two cases, otherwise you can't toggle between them duh!`);
		
		//Fetch next payload based on current value 
		function nextPayload () {
			const activePayload = caseArray.find(pay => pay.args[0] === eval(parse(varName)));
			const index = caseArray.indexOf(activePayload) +1;
			console.log(index);
			
			if (activePayload === undefined || index > caseArray.length-1) {
				return caseArray[0];
			} else {
				return caseArray[index];
			}
		}
		
		//Function that output the link element
		function linkBuilder(payload) {
		
			const value = payload.args[0], prompt = payload.args[1], innerAttr = payload.args.slice(2);	
			
			if (value === undefined)
				return this.error(`Case value (<<case 'value'>>) is undefined.`);
			
			const link = $(`<${type === undefined || type === 'link'? 'a' : type}/>`);
			
			//Global attributes + tag-based ones
			for (let i = 0; i < attributes.concat(innerAttr).length;i++) {
				if (typeof attributes[i] === 'object'){// jQuery style object
					link.attr(attributes[i]);
				} else { //Simple pair
					link.attr( attributes[i], attributes[i+1]);
					i++;
				}
			}
			
			link.wikiWithOptions({ profile : 'core' }, (prompt ? prompt : value)).addClass(`macro-toggle-${value}`);
			link.ariaClick({
					namespace : '.macros',
					role : type},
				this.createShadowWrapper(
					() => {
						$.wiki(payload.contents);
						State.setVar(varName, value);
						if (varName.split('.')[0] === 'settings'){
							//Settings need saving
							Setting.save();
						}
						commonCode ? $.wiki(commonCode.contents) : null;
						//Swap for next payload!
						link.replaceWith(linkBuilder.call(this,nextPayload()));
					}		
				)
			);
			return link;
		}
		$(this.output).append(linkBuilder.call(this, nextPayload()));
	}
})