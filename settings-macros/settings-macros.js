// Mali's settings macros

(() => {

	const past2_36 = !$('tw-storydata').attr('format-version').startsWith('2.36'), reg = [];

	$(':root').css({
		'--toggleOn': past2_36 ? "'\\f205'" : "'\\00a0\\00a0\\e831'",
		'--toggleOff': past2_36 ? "'\\f204'" : "'\\00a0\\00a0\\e830'",
		'--scFont': past2_36 ? 'sc-icons' : 'tme-fa-icons',
	});

	Macro.add(['addToggle', 'addList', 'addRange', 'addValue'], {
		tags: [
			'label', 'desc', // sauce
			'onInit', 'onChange', 'onAny', // payload options
			'list', 'range' // special
		],
		skipArgs: ['list'],

		handler() {

			if (State.length) return this.error(`<<${this.name}>> should only be used in StoryInit or init-tagged passages.`);

			// version check
			if (!Setting.addValue && this.name === 'addValue') return this.error(`The "value" type setting is only available in 2.37.0 and up versions of SugarCube.`);

			const id = this.args[0], type = this.name.slice(3).toLowerCase();
			if (!id || typeof id !== 'string') return this.error(`Improper setting name, reading "${id}".`);

			const def = {
				label: `Setting : ${id} ${type}.`
			};

			// process payload
			this.payload.forEach(p => {

				switch (p.name) {

					case 'onAny': case 'onInit': case 'onChange':

						function cb() {

							const oldThis = State.temporary.this;
							State.temporary.this = this;

							$.wiki(p.contents);

							State.temporary.this = oldThis;
						};

						if (p.name === 'onAny') {
							def.onChange = def.onInit = cb;
						} else {
							def[p.name] = cb;
						}
						return;

					case 'list':
						if (type !== 'list') return this.error(`<<${p.name}>> tag is only supported on list settings.`);

						let list;
						try {
							list = Scripting.evalJavaScript(p.args.full);
						} catch {
							return this.error(`Invalid expression.`);
						}

						if (!Array.isArray(list)) return this.error(`<<${p.name}>> needs to yield an array!`);
						return def.list = list;

					case 'range':
						if (type !== 'range') return this.error(`<<${p.name}>> tag is only supported on range settings.`);

						return ([def.min = 0, def.max = 100, def.step = 1] = p.args);

					default: def[p.name] = p.args[0] || p.contents;
				};

			});

			if (this.args.length > 1) def.default = this.args[1];

			Setting[this.name](id, def);
			reg.push(id);
		}
	});

	// run init handlers on next passage nav
	$(document).one(':storyready', () => {
		reg.forEach(id => {
			const def = Setting.get(id), value = settings[id] ?? def.default;

			settings[id] = value;
			def.onInit?.call(Object.assign({ value }, def));
		});
	});

	// create setting input
	const createInput = (id, def) => {
		let $control;

		// will be made obsolete by the new Setting.set()...
		const setValue = v => {
			def.value = settings[id] = v;
			def.onChange?.call(def);
			Setting.save();
		};

		switch (def.type) {
			case 1: // toggle button

				$control = $('<button>').attr({
					type: 'button',
					role: 'button',
					class: settings[id] ? 'enabled' : ''
				}).text(settings[id] ? 'On' : 'Off');

				$control.ariaClick(() => {
					setValue(!settings[id]);

					$control.text(settings[id] ? 'On' : 'Off').toggleClass('enabled');
				});

				break;
			case 2: // list select element

				$control = $('<select tabindex=0>').on('change', function () {
					setValue(def.list[this.value]);
				});

				// options
				def.list.forEach((v, i) => $control.append(`<option value=${i} ${settings[id] === v ? 'selected' : ''}>${v}</option>`));

				break;
			case 3: // range input

				$control = $('<input>').attr({
					type: 'range',
					value: settings[id],
					min: def.min,
					max: def.max,
					step: def.step
				}).on('change', function () {
					setValue(Number(this.value));
				});

				break;
			case 4: // arbitrary value - eval text

				$control = $('<input>').attr({
					type: 'text',
					placeholder: String(settings[id])
				}).on('change', function () {

					let v;
					try {
						v = State.getVar(`(${this.value})`);
					} catch {
						v = this.value;
					}
					setValue(v);
				});
		}

		return $control.attr('id', 'setting-control-' + id);
	},

	// create input containter (label, wrapper...)
	createContext = (id, def) => {
		// wrapper
		const $wrp = $('<div>').attr({
			class: 'setting-body',
			id: 'setting-body-' + id
		});

		// label
		$(`<label>`).attr({
			id: 'setting-label-' + id,
			for: 'setting-control-' + id
		}).wiki(
			def.label ?? `Setting : ${id} value.`
		).appendTo($wrp);

		// input
		$wrp.append(createInput(id, def));

		// desc
		if (def.desc) $wrp.append(`<p class='setting-desc'>${def.desc}</p>`);

		return $wrp;
	},
	
	// print multiple
	printSetting = (...ids) => {
		const $wrp = $('<div>').addClass('macro-setting');

		if (!ids.length) ids = false;

		Setting.forEach(def => {
			const id = def.name;

			if (ids && ids.includes(id)) return $wrp.append(createContext(id, clone(def)));
			if (!ids && def.type !== 4) $wrp.append(createContext(id, clone(def)));
		});

		return $wrp;
	};

	Macro.add('setting', {
		handler() {
			printSetting(...this.args).appendTo(this.output);
		}
	});

	setup.printSetting = printSetting;

})();

// End of settings macros