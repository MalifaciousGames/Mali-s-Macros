// Mali's <<live>> macro and 'live' passage tag
;{
   const makeLive = (wrapper, contents) => {
      const refresh = typeof contents === 'string' ? () => wrapper.empty().wiki(contents) : contents;

      wrapper
         .on('click', e => {
            // leaving current passage
            if (e.target.hasAttribute('data-passage')) return;

            const type = e.target.tagName;
            if (type === 'A' || type === 'BUTTON' || e.target.hasAttribute('onclick')) refresh();
         })
         .on('change drop', refresh);
   };

   // handling passages that have the 'live' tag
   $(document).on(':passagestart', e => {
      const { content, passage } = e.detail;

      if (!passage.tags.includes('live')) return;

      makeLive($(content), passage.processText());
   });

   // the <<live>> macro wrapper
   Macro.add('live', {
      isAsync: true,
      tags: null,

      handler() {
         const content = this.payload[0].contents,
            wrapper = $('<span>', { class: 'macro-' + this.name })
               .wiki(content)
               .appendTo(this.output);

         makeLive(wrapper, this.shadowHandler(() => wrapper.empty().wiki(content)));
      }
   });
};