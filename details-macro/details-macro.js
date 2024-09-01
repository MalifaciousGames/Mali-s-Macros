/* Mali's <<details>> macro */

Macro.add(['details', 'dt'], {
   tags: null,
   handler() {
      setup.openDetails ??= {};

      let [sum, ...args] = this.args, open = !!setup.openDetails[sum], name;

      if (args.delete('open').length) open = true;
      if (args.length) name = args[0];

      const $det = $('<details>')
         .addClass('macro-details')
         .wiki(
            `<summary>${sum}</summary>`,
            `<span class='inner-details'>${this.payload[0].contents}</span>`
         );

      if (name) $det.attr('name', name);
      if (open) $det.attr('open', true);

      // toggle the setup variable on click
      $det[0].addEventListener('toggle', function () {

         // make name attribute work on Mozilla
         if (name && Browser.isGecko && this.open) {
            document.querySelectorAll(`details[name="${name}"]`).forEach(e => {
               if (e !== this) e.open = false;
            });
         }

         setup.openDetails[sum] = this.open;

      });

      $det.appendTo(this.output);

   }
});