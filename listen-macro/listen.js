Macro.add('listen', {
	tags: ['payload'],
	isAsync : true,
	
	handler() {
	
		const payload = this.payload.find(pay => pay.name === 'payload'),
		event = this.args[0] ? this.args[0].replaceAll(',',' ') : 'change';
		
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

		const wrapper = $(document.createElement(this.args[1] ?? 'span'));
				
		wrapper.on(event, this.createShadowWrapper(runCode));
		wrapper.wiki(this.payload[0].contents).appendTo(this.output);
	}
});
