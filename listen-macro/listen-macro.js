/* Mali's <<listen>> macro for Sugarcube */

Macro.add('listen', {
   tags: ['when'],

   config: {
      silent: false,
      init: false,
      defaultEvents: ['change']
   },

   isAsync: true,

   argsToObj: function (args) {
      let argObject = {},
         i = 0;
      while (i < args.length) {
         const arg = args[i];
         if (Array.isArray(arg)) { //An array, splice into position
            args.splice(i--, 1, ...arg);
         } else if (typeof arg === 'object') { //Merge objects!
            Object.assign(argObject, arg);
         } else { //Following pairs
            const val = args[i += 1];
            if (val === undefined) {
               throw new Error('Uneven number of arguments.')
            };
            argObject[arg.toLowerCase()] = val;
         }
         i++;
      }
      return argObject;
   },

   processPayload(payload, wrapper) {

      const def = {
         init: this.self.config.init,
         silent: this.self.config.silent,
         events: []
      };

      // process args
      for (const arg of payload.args) {
         if (typeof arg !== 'string') continue;

         switch (arg.toLowerCase()) {
            case 'init':
               def.init = true;
               break;
            case 'silent':
               def.silent = true;
               break;
            default: def.events.push(arg);
         }
      }

      // process events
      if (!def.events.length) {
         def.events = this.self.config.defaultEvents;
      } else {
         def.events = def.events.flat(Infinity).map(t => t.split(/\s|,/g)).flat().filter(t => t);
      }

      // make output elem if needed
      if (!def.silent) {

         def.output = $('<span>', {
            class: `macro-${this.name}-output`,
            'data-event': def.events.join(' ')
         }).appendTo(wrapper);

      }

      // make and bind callback
      const callback = this[this.shadowHandler ? 'shadowHandler' : 'createShadowWrapper'](
         function (e) {
            State.temporary.event = e;

            if (def.silent) {
               $.wiki(payload.contents);
            } else {
               def.output.empty().wiki(payload.contents);
            }

         },
         () => delete State.temporary.event
      );

      wrapper.on(def.events.join(' '), callback);

      if (def.init) callback();
   },

   handler() {

      const attr = this.self.argsToObj(this.args);

      // special arguments
      const type = attr.type || 'span';
      delete attr.type;

      // output wrapper
      const wrapper = $(`<${type}>`, attr)
         .addClass(`macro-${this.name}`)
         .wiki(this.payload[0].contents)
         .appendTo(this.output);

      // process and bind <<when>> tags
      for (const payload of this.payload.slice(1)) {
         this.self.processPayload.call(this, payload, wrapper);
      }

   }
});

/* End of the <<listen>> macro */