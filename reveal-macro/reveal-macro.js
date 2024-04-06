// Mali's <<reveal>> macro

(() => {
   //config object
   const config = {
      innerElement: '<div>',
      macroName: 'reveal',
      transitionDelay: '.3s',
      args: {
         onHover: {
            default: false,
            keyWords: ['hover', 'onHover']
         },
         transition: {
            default: true,
            keyWords: ['t8n', 'transition']
         },
         startsOpen: {
            default: false,
            keyWords: ['open', 'startsOpen']
         }
      }
   };

   Macro.add(config.macroName, {
      tags: null,
      handler() {

         const title = String(this.args[0]).trim(), kw = [];

         //build config object
         this.config = {};
         for (const k in config.args) {
            const ent = config.args[k];
            kw.push(...ent.keyWords);
            this.config[k] = this.args.includesAny(...ent.keyWords) || ent.default;
         }

         //find groupID
         this.config.groupID = this.args.slice(1).find(a => !kw.includes(a));

         const $el = $('<details>').attr({ class: `macro-${this.name}` }),
            $title = $('<summary>').wiki(title).attr({ class: `macro-${this.name}-title` }),
            $inner = $(config.innerElement).attr({ class: `macro-${this.name}-inner` }).wiki(this.payload[0].contents),
            open = e => {
               //an hover event, open manually
               if (e.type === 'mouseenter') $el[0].open = true;

               //this is done manually because firefox doesn't support the 'name' attribute
               if (this.config.groupID) $(`details[data-groupID='${this.config.groupID}'][open]`).not($el).removeAttr('open');

               if (this.config.transition) {
                  $inner.addClass('t8n').one('animationend', () => $inner.removeClass('t8n'));
               }
            };

         $el.append($title, $inner);

         if (this.config.groupID) $el.attr({ 'data-groupID': this.config.groupID });

         if (this.config.startsOpen) $el.attr({ open: '' });
         //implement exclusive elements so it also works in FF

         $el.ariaClick(
            {
               label: title
            },
            open
         );

         if (this.config.onHover) {
            $el.on('mouseenter', open).on('mouseleave', () => {
               $el.removeAttr('open');
            });
         }

         this.output.appendChild($el[0]);
      }
   });

   $('head').append(`<style>
      details summary {
         cursor : pointer;
         display : revert;
      }

      .macro-${config.macroName}-inner.t8n {
         animation: ${config.macroName}-anim ${config.transitionDelay};
      }

      @keyframes ${config.macroName}-anim {
         0% {opacity: 0}
         to {opacity : 1}
      }
   </style>`);

})();