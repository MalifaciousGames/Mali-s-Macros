Macro.add('listen', {
	tags: ['then'],
	isAsync : true,
	
	handler() {
	
		const payload = this.payload.find(pay => pay.name === 'then'),
			event = (this.args[0] ? this.args[0].replaceAll(',',' ') : 'change'),
			attributes = this.args.slice(2);
		
		function runCode(e) {
			try {
				if (State.temporary.hasOwnProperty('event')) {
					var eventVar = State.temporary.event;
				}
				State.temporary.event = e;
				$.wiki(payload?.contents);
			} finally {
				eventVar !== undefined ?
					State.temporary.target = eventVar :
					delete State.temporary.target;
			}
		}

		const wrapper = $(document.createElement(this.args[1] || 'span'));
				
		for (let i = 0; i < attributes.length;i++) {
			if (typeof attributes[i] === 'object'){
				//JQuery style object
				wrapper.attr(attributes[i]);
			} else { // Simple pairs
				wrapper.attr(attributes[i], attributes[i+1]);
				i++;
			}
		}
		
		wrapper.on(event, this.createShadowWrapper(runCode));
		wrapper.wiki(this.payload[0].contents).appendTo(this.output);
	}
});
