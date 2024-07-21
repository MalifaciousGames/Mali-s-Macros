/* Maliface's <<on/once>> and <<trigger>> macros */

(() => {

	const listeners = [];

	// {element, listener id, type}
	$(document).on(':passageend', () => {

		let i = listeners.length - 1;
		while (i >= 0) {
			const { element, id, type } = listeners[i];

			if (!element.isConnected) {
				$(document).off(type + '.' + id);
				listeners.splice(i, 1);
			}
			i--;
		}
	});

	let count = 0;

	Macro.add(['on', 'once'], {
		isAsync: true,
		tags: null,
		handler() {

			if (!this.args[0]) return this.error(`Missing event type.`);

			let triggers = this.args.shift(), transition, attributes, type, hidden;

			if (typeof triggers === 'string') triggers = triggers.trim().split(/\s|,/g);

			while (this.args.length) {
				const cur = this.args.pop();

				if (typeof cur === 'object') { attributes = cur; continue }

				switch (cur) {
					case 'hidden': case 'startsHidden': hidden = true; continue;
					case 'transition': case 't8n': transition = true; continue;
					default: type = cur;
				}
			}

			// wrapper
			const $wrp = $(`<${type || 'span'}>`)
				.attr({ 'aria-live': 'polite' })
				.attr(attributes ?? {}) // try to find attribute object
				.addClass('macro-' + this.name);

			if (!hidden) $wrp.wiki(this.payload[0].contents);

			// define callback
			const callback = event => {

				if (!$wrp[0].isConnected) return;

				State.temporary.event = event;
				this.addShadow('_event');

				$wrp
					.empty()
					.wiki(this.payload[0].contents);

				if (transition) $wrp.fadeOut(0).fadeIn(400);

			}, shadowWrapper = this.shadowHandler ?? this.createShadowWrapper;

			for (const trigger of triggers) {

				const eventPointer = {
					element: $wrp[0],
					type: trigger,
					id: 'm-on-' + count++ // the id is unique
				};

				// attach listener
				$(document)[this.name === 'once' ? 'one' : 'on'](
					trigger + '.' + eventPointer.id,
					shadowWrapper.call(this, callback)
				);

				// still push the pointer for "one" events so they don't trigger after their wrapper is gone
				listeners.push(eventPointer);
			}

			$wrp.appendTo(this.output);

		}
	});

	Macro.add('trigger', {
		handler() {

			let events = this.args[0],
				target = this.args[1] ?? document;

			if (typeof events === 'string') events = events.trim().split(/\s|,/g);
			if (!Array.isArray(events)) events = [events]; // assume plain object

			for (const ev of events) $(target).trigger(ev);
		}
	});

})();

/* End of <<on/once>> and <<trigger>> */