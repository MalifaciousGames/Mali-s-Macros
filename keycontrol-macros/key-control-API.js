/* KeyControl API, format-agnostic, only requires jQuery */

window.KeyControl = class KeyControl {
	constructor(id, def) {
		if (typeof id !== 'string') throw new Error('Keybinding ID must be a string.');
		if (this.constructor.active.find(l => l.id === id)) throw new Error(`A key listener with the ${id} ID already exists.`);

		this.id = id;

		for (const k in def) {
			this[k] = def[k];
		}

		//key inputs
		if (!this.key) throw new Error('No input keys!');
		if (typeof this.key === 'string') this.key = this.key.split(' ');
		if (!Array.isArray(this.key)) throw new Error('Improper key type, must be either a string or an array!');

		//special keys
		if (typeof this.special === 'string') this.special = this.special.split(' ');
		if (this.special != null && !Array.isArray(this.special)) throw new Error('Improper special key, must be either a string or an array!');
		if (this.special?.some(k => !['ctrl', 'alt', 'shift'].includes(k))) throw new Error('Special keys can only be: ctrl, shift or alt.');

		//condition
		if (this.condition != null && typeof this.condition !== 'function') throw new Error('Improper condition type, must be a function.');

		//callback
		if (typeof this.callback !== 'function') throw new Error('Improper callback type, must be a function.');

		this.active ??= true;
		this.default = { key: this.key, special: this.special };
		this.setDisplay();

		this.constructor.active.push(this);
	}

	invoke(e) {
		if (!this.key.find(k => k === e.key || k === e.code)) return;
		if (this.special && !this.special.every(k => e[k + 'Key'])) return;
		if (this.condition && !this.condition.call(this, e)) return;

		this.callback.call(this, e);
		if (this.once) this.delete();
	}

	setKey(e, spcKey) {
		this.special = ['ctrl', 'alt', 'shift'].filter(k => e[k + 'Key']);
		if (spcKey) this.special.pushUnique(spcKey);

		this.key = [e.key];
		this.setDisplay();
	}

	reset() {
		this.key = this.default.key;
		this.special = this.default.special;
		this.setDisplay();
	}

	setDisplay() {
		let val = '';
		if (this.special?.length) val += this.special.join(' + ') + ' + ';
		val += this.key.join(' / ');
		return this.displayVal = val;
	}

	createInput() {
		return $(`<input id='${this.id}' class='keyInput' readonly>`).val(this.displayVal).on('keydown', e => {
			e.preventDefault();
			e.stopPropagation();

			this.setKey(e);
			$inp.val(this.displayVal);
		});
	}

	createInputContext() {
		//label
		const $label = $(`<label for='${this.id}' class='keyLabel'>`).append(`<span class='keyName'>${this.name ?? this.id} : </span>`);
		if (this.desc) $label.append(`<span class='keyDesc'>${this.desc}</span>`);

		//input elem
		this.createInput().appendTo($label);

		//reset button
		$(`<button class='keyReset'>Reset to default</button>`).attr({
			'aria-label': 'Reset to default value',
			role: 'button'
		}).on('click', _ => {
			this.reset();
			$inp.val(this.displayVal);
		}).appendTo($label);

		return $label;
	}

	delete() {
		const act = this.constructor.active, i = act.findIndex(k => k === this);
		act.splice(i, 1);
	}
	disable() { return this.active = false }
	toggle() { return this.active = !this.active }
	enable() { return this.active = true }

	static active = [];
	static run(e) {
		this.active.filter(l => l.active).forEach(l => l.invoke(e));
	};
	static add(id, def) {
		return new this(id, def);
	};
	static get(id) {
		return this.active.find(l => l.id === id) ?? new Error(`No listener found for the ${id} id.`);
	};
	static remove(id) {
		this.get(id).delete();
	};
	static createInputPanel() {
		const $grd = $(`<ul class='keyInputPanel' style='display:grid'>`);

		if (this.active.length) {
			this.active.forEach(kb => $grd.append(kb.createInput()));
		} else {
			$grd.append(`<span>No active key bindings.</span>`);
		}
		return $grd;
	}
};

$(document).on('keydown.KeyControlAPI', e => KeyControl.run(e));

/* End of the API */