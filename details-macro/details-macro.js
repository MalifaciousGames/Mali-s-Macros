/* Mali's <<details>> macro */

Macro.add(['details', 'dt'], {
   tags: ['summary', 'sum'],
   handler() {
      setup.openDetails ??= {};

      let [sum, ...args] = this.args,
         id = String(sum).trim(),
         open = !!setup.openDetails[id],
         name;

      // has a bespoke <<sum>>
      if (this.payload[1]) sum = this.payload[1].contents;

      if (args.delete('open').length) open = true;
      if (args.length) name = args[0];

      const $det = $('<details>')
         .attr({
            class: 'macro-details',
            'data-id': id,
            open
         })
         .wiki(
            `<summary>${sum}</summary>`,
            `<span class='inner-details'>${this.payload[0].contents}</span>`
         );

      if (name) $det.attr('name', name);

      // toggle the setup variable on click
      $det[0].addEventListener('toggle', function () {

         // make name attribute work on Mozilla
         if (name && Browser.isGecko && this.open) {
            document.querySelectorAll(`details[name="${name}"]`).forEach(e => {
               if (e !== this) e.open = false;
            });
         }

         setup.openDetails[id] = this.open;

      });

      $det.appendTo(this.output);

   }
});