/* Mali's input macro set */

((count = 0) => {

   //args parser, minified
   const parseArgs = r => { let e = {}, t = 0; for (; t < r.length;) { const n = r[t]; if ("object" == typeof n) Array.isArray(n) ? r.splice(t--, 1, ...n) : Object.assign(e, n); else { const o = r[t += 1]; if (void 0 === o) throw new Error("Uneven number of arguments."); if ("string" != typeof n) throw new Error(`Attribute key must be a string, reading: '${n}'.`); e[n.toLowerCase()] = o } t++ } return e };

   const enforceType = (input, { clamp, preset, sanitize }) => {
      switch (preset.type) {
         case 'boolean':
            return input.checked;
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
      config.on.push({ check, payload: p.contents.trim(), override });
   };

   function addOptions($trg, collection, selectVal) {
      let col = {};

      (collection instanceof Array || collection instanceof Set) ? collection.forEach(v => col[v] = v) : col = collection;

      for (const k in col) {
         const sl = col[k] === selectVal ? 'selected' : '',
            safeVal = Util.escape(col[k]); //Util.escape converts to string on its end
         $trg.append(`<option value='${safeVal}' ${sl}>${k}</option>`);
      }
   };

   const validTypes = {
      area: { elem: 'textarea', attr: { spellcheck: false } },
      color: {},
      checkbox: { type: 'boolean' },
      date: { type: 'date' },
      email: { list: true },
      file: { type: 'file' },
      number: { type: 'number', list: true },
      password: { list: true },
      range: { type: 'number' },
      search: { list: true },
      select: { elem: 'select', list: 'onSelf' },
      tel: { list: true },
      text: { list: true },
      time: { list: true },
      url: { list: true }
   },
      validNames = Object.keys(validTypes).map(k => 'input-' + k);

   Macro.add(['input', ...validNames], {
      tags: ['onvalue', 'default', 'optionsfrom'],
      skipArgs: ['optionsfrom'],
      isAsync: true,

      types: validTypes,
      names: validNames,

      handler() {

         const config = {
            type: 'text',
            on: [], //the possible values we check for
            value: null,
            any: this.payload[0].contents.trim(),
            clamp: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
            label: '', //label text
            sanitize: false,
            goto: null,
            variable: null,
            listID: `list-${count++}` //an inner id system to bind datalist
         }, attr = parseArgs(this.args);

         //commit special attributes to config and remove them
         ['type', 'value', 'goto', 'label', 'sanitize', 'variable'].forEach(a => {
            if (attr.hasOwnProperty(a)) {
               config[a] = attr[a];
               delete attr[a];
            }
         });

         //macro name overrides type
         if (this.name.includes('-')) config.type = this.name.slice(6);

         config.preset = this.self.types[config.type] ?? {};

         let $input;

         if (config.preset.elem) {//elem is actually not an input...
            $input = $(document.createElement(config.preset.elem)).attr({ tabindex: 0 });
         } else {//is <input>
            $input = $('<input>').attr({
               type: config.type,
               value: config.value,
               tabindex: 0
            });
         }

         //set value to variable if any
         if (config.variable) {
            if (typeof config.variable !== 'string') return this.error(`Variable parameter must be a quoted variable, reading ${config.variable}`);

            //if a value is supplied, set the variable to it
            if (config.value) State.setVar(config.variable, config.value);

            //set input value to match variable
            const v = State.getVar(config.variable);

            if (config.type === 'checkbox') {
               $input[0].checked = !!v;
            } else if (v != null && config.type !== 'file') {
               $input[0].value = v;
            }
         }

         // min/max, fetch them but don't delete them
         ['min', 'max'].map(a => attr.hasOwnProperty(a) ? config.clamp[a] = attr[a] : null);

         const $wrp = $('<label>').attr({
            class: 'macro-input-label'
         }).text(config.label);

         $input
            .attr(config.preset.attr ?? {})
            .attr(attr)
            .addClass('macro-input')
            .appendTo($wrp);

         this.payload.forEach(p => {
            switch (p.name) {
               case 'onvalue': buildOnValue.call(this, p, config); break;
               case 'optionsfrom':

                  if (!config.preset.list) return this.error(`${config.type} input cannot have an <<optionsfrom>> argument.`);

                  let collection = Scripting.evalJavaScript(`(${p.args.full})`);

                  //Build list if needed
                  if (config.preset.list === 'onSelf') {
                     //<select> elem, append options to it + try to select value
                     addOptions($input, collection, config.value);
                  } else {
                     const $list = $(`<datalist id='${config.listID}'>`).appendTo($wrp);
                     $input.attr({ list: config.listID });

                     addOptions($list, collection);
                  }

                  break;

               case 'default':
                  config.on.default = p.contents.trim();
            }
         });

         let oldThis;
         $input.on('change', this.createShadowWrapper(() => {
            let value = enforceType($input[0], config);
            const valueMatch = config.on.find(p => p.check(value)); //find matching case if any

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
            } else if (config.on.default) {
               $.wiki(config.on.default);
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

/* End of the input macro set */