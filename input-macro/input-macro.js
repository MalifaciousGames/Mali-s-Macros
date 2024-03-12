/* Mali's input macro */

((count = 0) => {

   //args parser, minified
   const parseArgs = r => { let e = {}, t = 0; for (; t < r.length;) { const n = r[t]; if ("object" == typeof n) Array.isArray(n) ? r.splice(t--, 1, ...n) : Object.assign(e, n); else { const o = r[t += 1]; if (void 0 === o) throw new Error("Uneven number of arguments."); if ("string" != typeof n) throw new Error(`Attribute key must be a string, reading: '${n}'.`); e[n.toLowerCase()] = o } t++ } return e };

   const enforceType = (input, { clamp, preset, sanitize }) => {
      switch (preset.type) {
         case 'file':
            return input.files;
         case 'number':
            const v = Math.clamp(Number(input.value), clamp.min, clamp.max);
            input.value = v;
            return v;
         case 'date': return new Date(input.value);
         default: return sanitize ? Util.escapeMarkup(input.value) : input.value;
      }
   };

   function buildOnValue(p, config) {
      let check, [val, override] = p.args, type = typeof val, validType = config.preset.type ?? 'string';

      if (val instanceof RegExp) {
         if (validType !== 'string') return this.error(`A ${config.type} input doesn't yield a string, you can't test it against a regular expression.`);
         check = v => val.test(v);
      } else if (val instanceof Date) {
         if (config.preset.type !== 'date') return this.error(`A ${config.type} input doesn't yield a date object you can check against.`);
         check = v => val.toString() === v.toString();
      } else if (type === 'function') {
         check = val;
      } else {
         if (type !== validType) return this.error(`A ${config.type} input cannot return ${val} (${type}).`);
         check = v => v === val;
      }

      config.values.push({ check, payload: p.contents.trim(), override });
   };

   const validTypes = {
      color: {},
      date: { type: 'date' },
      email: { list: true },
      file: { type: 'file' },
      number: { type: 'number', list: true },
      password: { list: true },
      range: { type: 'number' },
      search: { list: true },
      tel: { list: true },
      text: { list: true },
      time: { list: true },
      url: { list: true }
   }, validNames = Object.keys(validTypes).map(k => 'input-' + k);

   Macro.add(['input', ...validNames], {
      tags: ['onvalue', 'default', 'optionsfrom'],
      skipArgs: ['optionsfrom'],
      isAsync: true,

      types: validTypes,
      names: validNames,

      handler() {

         const config = {
            type: 'text',
            values: [], //the possible values we check for
            any: this.payload[0].contents.trim(),
            clamp: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
            label: '', //label text
            sanitize: false,
            goto: null,
            variable: null,
            id: `macro-${this.name}-${count++}` //an inner id system to bind datalist
         }, attr = parseArgs(this.args);

         //commit special attributes to config and remove them
         ['type', 'goto', 'label', 'sanitize', 'variable'].forEach(a => {
            if (attr.hasOwnProperty(a)) {
               config[a] = attr[a];
               delete attr[a];
            }
         });

         //macro name overrides type
         if (this.name.includes('-')) config.type = this.name.slice(6);

         config.preset = this.self.types[config.type];

         const $input = $('<input>').attr({
            type: config.type,
            tabindex: 0
         });

         //set value to variable if any
         if (config.variable) {
            if (typeof config.variable !== 'string') return this.error(`Variable parameter must be a quoted variable, reading ${config.variable}`);
            const v = State.getVar(config.variable);
            if (v != null && config.type !== 'file') $input.val(v);
         }

         //min/max
         if (attr.hasOwnProperty('min')) config.clamp.min = attr.min;
         if (attr.hasOwnProperty('max')) config.clamp.max = attr.max;

         const $wrp = $('<label>').attr({
            class: 'macro-input-label'
         }).text(config.label);

         $input.attr(attr)
            .addClass('macro-input')
            .appendTo($wrp);

         this.payload.forEach(p => {
            switch (p.name) {
               case 'onvalue': buildOnValue.call(this, p, config); break;
               case 'optionsfrom':

                  if (!config.preset.list) return this.error(`${config.type} input cannot have an <<optionsfrom>> argument.`);

                  const collection = Scripting.evalJavaScript(`(${p.args.full})`);
                  const list = $(`<datalist id='${config.id}-list'>`).appendTo($wrp);

                  for (const v of collection) list.append(`<option value='${v}'>`);

                  $input.attr({ list: config.id + '-list' });
                  break;

               case 'default':
                  config.values.default = p.contents.trim();
            }
         });

         let oldThis;
         $input.on('change', this.createShadowWrapper(() => {
            let value = enforceType($input[0], config);
            const valueMatch = config.values.find(p => p.check(value)); //find matching case if any

            //do override if any
            if (valueMatch && valueMatch.override != null) $input[0].value = value = valueMatch.override;

            //set variable if necessary
            if (config.variable) State.setVar(config.variable, value);

            //add variable shadowing
            oldThis = State.temporary.this;
            State.temporary.this = { config, value, input: $input[0], wrapper: $wrp[0] };
            this.addShadow('_this');

            if (valueMatch) {
               $.wiki(valueMatch.payload);
            } else if (config.values.default) {
               $.wiki(config.values.default);
            }

            $.wiki(config.any);

         },
            () => State.temporary.this = oldThis
         ));

         //do the on-enter navigation... I really hate this mechanic...
         $input.on('keypress', e => {
            if (e.which === 13 && config.goto != null) {
               //get passage from link markup
               Engine.play(typeof config.goto === 'object' ? config.goto.link : config.goto);
            }
         });

         $wrp.appendTo(this.output);
      }
   });

})();
