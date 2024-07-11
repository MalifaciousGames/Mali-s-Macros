/* Maliface's <<on>> macro 
Syntax : 
	<<on 'event1 [, event2...]' [elementType] [t8n] [hidden] [{attributes object}]>>
		..code to run/refresh...
	<</on>>
*/

//Clean unused listeners
$(document).on(':passageend', () => {
	let events = Macro.get('on').activeListeners, i = events.length;
	while (i--) {
		const e = events[i];
		//Check if update wrapper is still on the page
		if (!$(`[data-id='${e.split('.').last()}']`).length) {
			$(document).off(events.delete(e)[0]);
		}
	};
});

Macro.add('on', {
	isAsync: true,
	tags: null,
	activeListeners: [],
	counter: 0,

	handler() {
		if (!this.args[0]) {
			return this.error(`Missing event type.`);
		} else if (typeof this.args[0] !== 'string') {
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		};

		const def = this.self, id = def.counter++, payload = this.payload[0].contents,
			wrapper = $(document.createElement(this.args[1] || 'span')).attr('data-id', `macro-on-${id}`), attributes = this.args.find(o => typeof o === 'object'),
			events = this.args[0].split(',').map(e => `${e.trim()}.macro-on-${id}`),
			t8n = this.args.includesAny('t8n', 'transition'), startHidden = this.args.includesAny('startHidden', 'hidden');

		if (attributes) { wrapper.attr(attributes) };
		if (!startHidden) { wrapper.wiki(payload) };

		// Apply listener for each event name
		events.forEach(event => {
			def.activeListeners.push(event);
			$(document).on(event, this.createShadowWrapper((e) => {
				const oldE = State.temporary.event;
				State.temporary.event = e;
				try {
					wrapper.empty().wiki(payload)
					if (t8n) { wrapper.fadeOut(0).fadeIn(400) }
				} finally {
					oldE === undefined ? delete State.temporary.event : State.temporary.event = oldE;
				}
			}));
		});
		wrapper.addClass(`macro-${this.name}`).appendTo(this.output);
	}
});

// Triggers custom events

Macro.add('trigger', {
	handler() {

		let trig = this.args[0];

		if (!['string', 'object'].includes(typeof trig)) {
			return this.error(`Invalid event type, reading :'${typeof trig}'.`);
		}

		if (typeof trig === 'string') { //Comma-separated string of events
			trig = trig.split(',').map(event => event.trim());
		} else if (typeof trig === 'object' && !Array.isArray(trig)) { //A single event object
			trig = [trig];
		}//Do nothing if trig is already an array, it's fine

		// Triggers each event supplied
		trig.forEach(event => {
			$(this.args[1] ?? document).trigger(event);
		});
	}
});
