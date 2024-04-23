/* Mali's cooldown macro */

Macro.add('cooldown', {
   tags: null,
   clickTargets : ['a','button', 'input[type="button"]', 'input[type="submit"]','area'],
   handler() {

      const $wrp = $('<span>').addClass(`macro-${this.name}`).wiki(this.payload[0].contents), targetAll = this.args[1], clickTrg = this.self.clickTargets;
      let time = this.args[0] ?? 40;

      if (typeof time === 'string') {
         const [_, num, unit] = time.match(/([.\d]+)(\w*)/);
         time = Number(num);
         switch (unit) {
            case 'ms': break;
            case 's': time *= 1000; break;
            case 'min': time *= 60000; break;
            default: if (unit) return this.error(`Improper time unit : ${unit}.`);
         }
      }
      time = Math.max(time, 40);

      $wrp.on('click', e => {

         if (!clickTrg.includes(e.target.localName)) return;

         const $trg = targetAll ? $wrp.find(clickTrg.join()) : $(e.target);
         $trg.ariaDisabled(1);
         setTimeout(() => { $trg.ariaDisabled(0) }, time);

      });

      this.output.appendChild($wrp[0]);
   }
});