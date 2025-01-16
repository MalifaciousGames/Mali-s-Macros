/* Mali's <<details>> macro */

Macro.add(['details', 'dt'], {
   tags: ['summary', 'sum'],
   handler() {
      setup.openDetails ??= {};

      let [sum, ...args] = this.args,
         id = String(sum).trim(),
         open = !!setup.openDetails[id],
         name = '';

      // has a bespoke <<sum>>
      if (this.payload[1]) sum = this.payload[1].contents;
      
      if (args.delete('open').length) open = true;
      if (args.length) name = args[0];

      $('<details>', {
         class: 'macro-details',
         'data-id': id,
         name,
         open
      }).wiki(
         `<summary>${sum}</summary>`,
         `<span class='inner-details'>${this.payload[0].contents}</span>`
      ).on('toggle', function () {
         setup.openDetails[id] = this.open;
      }).appendTo(this.output);

   }
});