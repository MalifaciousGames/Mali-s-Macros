/* Mali's <<exclusive>> macro for Sugarcube */

Macro.add(['exclusive', 'exc'], {
   tags: ['onclick'],

   defaultMode: 'delete',
   defaultSelector : 'a, button, [onclick], [role="link"]',

   handler() {
      let mode = this.self.defaultMode, selector = this.self.defaultSelector, cb;

      // process args
      if (typeof this.args[0] === 'string') {
         const prs = this.args[0].toLowerCase().trim();
         if (prs === 'disable' || prs === 'dis') mode = 'disable';
         if (prs === 'empty') mode = 'empty';
      }

      if (typeof this.args[1] === 'string') selector = this.args[1];

      // process onclick payload
      if (this.payload[1]) cb = this.shadowHandler(() => {
         $.wiki(this.payload[1].contents);
      });

      // event handler
      const handler = ev => {
         if (!ev.target.closest(selector)) return; // no reactive click

         const $actives = $wrapper.find(selector);

         setTimeout(() => { // we wait for macros to do their thing, needed for linkreplace
            switch (mode) {
               case 'disable': $actives.ariaDisabled(true); break;
               case 'empty': $wrapper.empty(); break;
               case 'delete': $actives.remove(); break;
            };

            if (cb) cb.call();
         });
      };

      // macro wrapper
      const $wrapper =
         $('<span>', {
            class: 'macro-exclusive',
            'data-mode': mode
         })
            .wiki(this.payload[0].contents)
            .appendTo(this.output);

      // catch clicks on capture
      $wrapper[0].addEventListener('click', handler, { capture: true });

   }
});