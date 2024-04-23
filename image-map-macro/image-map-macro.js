/* Mali's <<image-map>> macro set */

(() => {

   const settings = {
      map: {
         name: 'image-map',
         tags: ['onClick', 'layers'], // you can rename tags, do not change the order however!
      },
      area: {
         name: 'area',
         tags: ['hover', 'overlay'], // you can rename tags, do not change the order however!
         liveHover: false, // hover re-runs its contents on hover
         hoverClickDuration: 100, // the duration before the 'clicked' class is removed on hover
         liveOverlay: false // the overlay re-runs its contents on click
      }
   };

   // arg parser and tag getter, minified
   const parseArgs=r=>{let e={},t=0;for(;t<r.length;){const n=r[t];if("object"==typeof n)Array.isArray(n)?r.splice(t--,1,...n):Object.assign(e,n);else{const s=r[t+=1];if(void 0===s)throw new Error("Uneven number of arguments.");if("string"!=typeof n)throw new Error(`Attribute key must be a string, reading: '${n}'.`);e[n.toLowerCase()]=s}t++}return e},getTag=function(r){const e=this.payload.find((e=>e.name===r));return e&&(e.attr=parseArgs(e.args)),e};

   const coordsToCSS = (coords) => {
      //ratio has been applied!
      switch (coords.length) {
         // x, y, radius => circle
         case 3: return {
            top: coords[1] - coords[2], left: coords[0] - coords[2],
            width: coords[2] * 2, height: coords[2] * 2,
         };
         // x1,y1,x2,y2 => rectangle
         case 4: return {
            left: coords[0], top: coords[1],
            width: coords[2] - coords[0], height: coords[3] - coords[1]
         };
         //a poly
         default:
            let path = '', x = [], y = [];
            y.min = x.min = Infinity;
            y.max = x.max = 0;

            coords.forEach((c, i) => {
               if (i % 2) {
                  if (c > y.max) y.max = c;
                  if (c < y.min) y.min = c;
                  y.push(c);
               } else {
                  if (c > x.max) x.max = c;
                  if (c < x.min) x.min = c;
                  x.push(c);
               }
            });

            for (let i = 0; i < x.length; i++) path += `${x[i]}px ${y[i]}px,`

            return {
               top: 0, left: 0,
               'padding-top': y.min + 'px', 'padding-left': x.min + 'px',
               width: x.max - x.min + 'px', height: y.max - y.min + 'px',
               'clip-path': `polygon(${path.slice(0, -1)})`
            };
      }
   };

   // MAP
   Macro.add(settings.map.name, {
      tags: settings.map.tags,
      count: 0,
      handler() {
         if (typeof this.args[0] !== 'string') return this.error(`Image url must be a string! Currently : ${this.args[0]}.`);

         const config = {
            name: this.name + (this.self.count++),
            attr: parseArgs(this.args.slice(1)),
            click: getTag.call(this, settings.map.tags[0]),
            layers: getTag.call(this, settings.map.tags[1])
         };

         // convert width/height attr to css
         config.attr.style ??= '';
         ['width', 'height'].forEach(n => {
            if (config.attr[n]) config.attr.style += `;${n} : ${config.attr[n]}`;
         });

         this.wrapper = $('<div>').attr(config.attr).addClass(this.name + '-wrapper');

         // the image itself
         const $img = $('<img>').attr({
            src: this.args[0],
            usemap: '#' + config.name
         }).appendTo(this.wrapper);

         this.map = $('<map>').attr('name', config.name).appendTo(this.wrapper);

         // use a resize observer to set size
         new ResizeObserver(() => {
            const { naturalHeight, naturalWidth, height, width } = $img[0], ratio = { y: height / naturalHeight, x: width / naturalWidth };
            this.map.find('area').trigger({ type: 'sizeToRatio', ratio });
         }).observe($img[0]);

         this.wrapper.wiki(this.payload[0].contents);

         // <<onClick>> listener
         if (config.click) this.wrapper.on('click', e => e.target.nodeName === 'AREA' ? $.wiki(config.click.contents) : null);

         // layers
         if (config.layers) {
            const $frg = $(new DocumentFragment()).wiki(config.layers.contents);
            // we wiki so conditional macros can run, then fetch the resulting images
            const imgs = $frg.find('img').addClass(this.name + '-layer');
            this.wrapper.append(imgs);
         }

         this.output.appendChild(this.wrapper[0]);
      }
   });

   // AREA
   Macro.add(settings.area.name, {
      tags: settings.area.tags,
      handler() {

         // find parent map!
         let mapParent = this;
         while (mapParent && mapParent.name !== settings.map.name) mapParent = mapParent.parent;

         if (!mapParent) return this.error(`<<${this.name}>> macro can only be used inside a <<${settings.map.name}>> macro!`);

         const { map, wrapper } = mapParent;

         // process payload/args

         const config = {
            shape: null,
            coords: this.args[0],
            attr: parseArgs(this.args.slice(1)),
            payload: this.payload[0].contents.trim(),
            hover: getTag.call(this, settings.area.tags[0]),
            overlay: getTag.call(this, settings.area.tags[1]),
         };
         console.log(config);

         //process coords

         if (typeof config.coords === 'string') config.coords = config.coords.split(',');
         config.coords = config.coords.map((n, i) => Number(n));

         switch (config.coords.length) {
            case 0: case 1: case 2: return this.error(`Improper number of coordinates!`);
            case 3: config.shape = 'circle'; break;
            case 4: config.shape = 'rect'; break;
            default: config.shape = 'poly';
         }

         // poly coordinates are not even, we can't have that!
         if (config.shape === 'poly' && config.coords.length % 2) return this.error(`Odd number of coordinates! Each poly point should have an x and y value: x1,y1, x2,y2...`);

         // <area> elem
         const $area = $('<area>').attr(config.attr).attr({
            shape: config.shape,
            coords: this.args[0]
         }).appendTo(map);

         // scale elements when the map parent triggers a `sizeToRatio` event
         $area.on('sizeToRatio', e => {
            //address the coords on <area>
            const adjCoords = config.coords.map((n, i) => Number(n) * e.ratio[i % 2 ? 'y' : 'x']);
            $area.attr({ coords: adjCoords.join() });

            // size the elems
            const css = coordsToCSS(adjCoords);
            if (config.hover.elem) config.hover.elem.css(css);
            if (config.overlay.elem) config.overlay.elem.css(css);

            // prevent propagation
            return false;
         });

         // click listener, run body contents

         $area.ariaClick(this.createShadowWrapper(() => {

            $.wiki(config.payload);

            if (config.hover) {
               config.hover.elem.addClass('clicked');
               setTimeout(() => config.hover.elem.removeClass('clicked'), settings.area.hoverClickDuration);
            }

            if (config.overlay?.live) {
               config.overlay.elem.empty().wiki(config.overlay.contents);
            }

         }));

         // hover highlight
         if (config.hover) {
            const live = config.hover.attr.live ?? settings.area.liveHover;
            delete config.hover.attr.live;

            config.hover.elem = $(`<div>`)
               .attr(config.hover.attr)
               .wiki(config.hover.contents)
               .addClass('area-hover ' + config.shape + (config.attr.disabled ? ' disabled' : ''))
               .appendTo(wrapper);

            // hover/focus handlers
            $area.on('mouseover focus', () => {
               if (live) this.createShadowWrapper(config.hover.elem.empty().wiki(config.hover.contents));
               config.hover.elem.show();
            }).on('mouseout focusout', () => config.hover.elem.hide());
         }

         // static overlay
         if (config.overlay) {

            config.overlay.live = config.overlay.attr.live ?? settings.area.liveOverlay;
            delete config.overlay.attr.live;

            config.overlay.elem = $('<div>')
               .attr(config.overlay.attr)
               .wiki(config.overlay.contents)
               .addClass('area-overlay ' + config.shape)
               .appendTo(wrapper);

         }

         // _this shadowing
         State.temporary.this = {
            hover: config.hover?.elem,
            overlay: config.overlay?.elem,
            area: $area
         };
         this.addShadow('_this');

      }
   });

})();

/* End of Mali's <<image-map>> macro set */