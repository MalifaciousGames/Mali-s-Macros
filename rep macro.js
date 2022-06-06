// Modified repeat macro: <<rep TimeSeconds '#TargetID' maxRep>>

Macro.add('rep', {
	isAsync : true,
	tags    : null,
	timers  : new Set(),

	handler() {
			
		let delay, target;
			
// Makes delay a seconds value if the 's' is missing

		delay = (typeof this.args[0] == 'number')? this.args[0] + 's' : this.args[0];
			
		if (this.args[1]){
			(typeof this.args[1] == 'number') ? window.maxRep = this.args[1] : target = $(this.args[1]);
		}
			
		if (this.args[2]){
			(typeof this.args[2] == 'number') ? window.maxRep = this.args[2] : target = $(this.args[2]);
		}
			
// Error return 
			
		try {
			delay = Math.max(Engine.minDomActionDelay, Util.fromCssTime(delay));
		}
		catch (ex) {
			return this.error(ex.message);
		}

// Register the timer.
			
		this.self.registerInterval(this.createShadowWrapper(() => {

			let $wrapper = jQuery(document.createElement('span'))
			.appendTo(this.output);
				
			const frag = document.createDocumentFragment();
			new Wikifier(frag, this.payload[0].contents);
				
			if (target && target.length != 0) {
				$(target).append($wrapper.append(frag));
			}
			else {
				$('.passage').append($wrapper.append(frag));
			}
				
		}), delay);
	},

	registerInterval(callback, delay) {
		if (typeof callback !== 'function') {
			throw new TypeError('callback parameter must be a function');
		}

// Cache info about the current turn.
		const passage = State.passage;
		const turn    = State.turns;

// Timer info.
		const timers = this.timers;
		let timerId = null;
		let i = 0;
			
// Set up the interval.
		timerId = setInterval(() => {
				
// Terminate if we've navigated away.

		if (State.passage !== passage || State.turns !== turn) {
			clearInterval(timerId);
			timers.delete(timerId);
			$(document).trigger(':repeatEnd');
			return;
		}

		let timerIdCache;
/*
There's no catch clause because this try/finally is here simply to ensure that proper cleanup is done in the event that an exception is thrown during the `Wikifier` call.
*/
		try {
			TempState.break = null;

// Set up the `repeatTimerId` value, caching the existing value, if necessary.
			if (TempState.hasOwnProperty('repeatTimerId')) {
				timerIdCache = TempState.repeatTimerId;
			}

			TempState.repeatTimerId = timerId;

// Execute the callback.
			callback.call(this);
		}
		finally {
// Teardown the `repeatTimerId` property, restoring the cached value, if necessary.
			if (typeof timerIdCache !== 'undefined') {
				TempState.repeatTimerId = timerIdCache;
			}
			else {
				delete TempState.repeatTimerId;
			}

			TempState.break = null;
		}
				
// Stop repeat if max is reached
		if (window.maxRep){
			i++;
			if (i >= maxRep){
				clearInterval(timerId);
				timers.delete(timerId);
				TempState.break = 2;
				$(document).trigger(':repeatEnd');
			}
		}
	}, delay);
			
	timers.add(timerId);

// Set up a single-use `prehistory` task to remove pending timers.
	if (!prehistory.hasOwnProperty('#repeat-timers-cleanup')) {
		prehistory['#repeat-timers-cleanup'] = task => {
		delete prehistory[task]; // single-use task
		timers.forEach(timerId => clearInterval(timerId));
		timers.clear();
	};
}
}
});

// Acts like the <<stop>> macro for default repeat

Macro.add('st', {
	skipArgs : true,

	handler() {
		if (!TempState.hasOwnProperty('repeatTimerId')) {
			return this.error('<<st>> must be used in conjunction with its parent macro <<rep>>');
		}

		const timers  = Macro.get('rep').timers;
		const timerId = TempState.repeatTimerId;
			
		clearInterval(timerId);
		timers.delete(timerId);
		TempState.break = 2;
		$(document).trigger(':repeatEnd');
			
// Custom debug view setup.
		if (Config.debug) {
			this.debugView.modes({ hidden : true });
		}
	}
});