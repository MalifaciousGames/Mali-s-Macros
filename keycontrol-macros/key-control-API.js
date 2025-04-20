/* KeyControl API, format-agnostic, only requires jQuery */

window.KeyControl = class KeyControl {
   constructor(id, def) {
      if (typeof id !== 'string') throw new Error('Keybinding ID must be a string.');
      if (this.constructor.active.find(l => l.id === id)) throw new Error(`A key listener with the ${id} ID already exists.`);

      this.id = id;

      for (const k in def) {
         this[k] = def[k];
      }

      //key inputs
      if (!this.key) throw new Error('No input keys!');
      if (typeof this.key === 'string') this.key = this.key.split(' ');
      if (!Array.isArray(this.key)) throw new Error('Improper key type, must be either a string or an array!');

      //special keys
      if (typeof this.special === 'string') this.special = this.special.split(' ');
      if (this.special != null && !Array.isArray(this.special)) throw new Error('Improper special key, must be either a string or an array!');
      if (this.special?.some(k => !['ctrl', 'alt', 'shift'].includes(k))) throw new Error('Special keys can only be: ctrl, shift or alt.');

      this.default = { key: this.key, special: this.special };
      //try to fetch key values from memory
      const fromMem = this.keysFromMemory();
      if (fromMem) {
         for (const k in fromMem) {
            this[k] = fromMem[k];
         }
      }

      //condition
      if (this.condition != null && typeof this.condition !== 'function') throw new Error('Improper condition type, must be a function.');

      //callback
      if (typeof this.callback !== 'function') throw new Error('Improper callback type, must be a function.');

      this.active ??= true;

      this.setDisplay();

      this.constructor.active.push(this);
   }

   invoke(e) {

      if (!this.key.find(k => k === e.key || k === e.code)) return;
      if (this.special && !this.special.every(k => e[k + 'Key'])) return;
      if (this.condition && !this.condition.call(this, e)) return;

      this.callback.call(this, e);
      if (this.once) this.delete();
   }

   setKey(e, spcKey) {
      this.special = ['ctrl', 'alt', 'shift'].filter(k => e[k + 'Key']);
      if (spcKey) this.special.pushUnique(spcKey);

      this.key = [e.key];
      this.keysToMemory();
      this.setDisplay();
   }

   reset() {
      this.key = this.default.key;
      this.special = this.default.special;
      localStorage.removeItem(this.getMemoryId());
      this.setDisplay();
   }

   setDisplay() {
      let val = '';
      if (this.special?.length) val += this.special.join(' + ') + ' + ';
      val += this.key.join(' / ');
      return this.displayVal = val;
   }

   createInput() {
      this.input = $(`<input readonly>`).attr({
         id: this.id,
         class: 'keyInput',
         placeholder: 'Enter key binding'
      }).val(this.displayVal);

      this.input.on('keydown', e => {
         if (e.key === 'Tab') return;
         e.preventDefault();
         e.stopPropagation();

         this.setKey(e);
         this.input.val(this.displayVal);
      }).on('focus', _ => this.input.val(''))
         .on('focusout', _ => this.input.val(this.displayVal));

      return this.input;
   }

   createResetButton() {
      return $(`<button class='keyReset'>Reset to default</button>`).attr({
         'aria-label': 'Reset to default value',
         role: 'button'
      }).on('click', _ => {
         this.reset();
         this.input.val(this.displayVal);
      });
   }

   createInputContext() {
      const $wrp = $(`<div class='keyWrapper'>`).append(`<span class='keyName'>${this.name ?? this.id}</span>`);

      this.createInput().appendTo($wrp);
      this.createResetButton().appendTo($wrp);

      return $wrp;
   }

   getMemoryId() {
      const tw = $('tw-storydata')[0];
      return tw.getAttribute('name') + ':' + tw.getAttribute('ifid') + ':' + this.id;
   }

   keysFromMemory() {
      const keys = localStorage.getItem(this.getMemoryId());
      return keys ? JSON.parse(keys) : null;
   }

   keysToMemory() {
      const kObj = { key: this.key, special: this.special };
      localStorage.setItem(this.getMemoryId(), JSON.stringify(kObj));
   }

   delete() {
      const act = this.constructor.active, i = act.findIndex(k => k === this);
      act.splice(i, 1);
   }
   disable() { return this.active = false }
   toggle() { return this.active = !this.active }
   enable() { return this.active = true }

   static active = [];
   static coolDown = false;
   static run(e) {

      if (['input', 'textarea'].includes(e.target.nodeName.toLowerCase())) return;
      if (e.target.isContentEditable) return;

      if (this.coolDown) return;

      this.coolDown = true;
      setTimeout(() => { this.coolDown = false }, 200);
      this.active.filter(l => l.active).forEach(l => l.invoke(e));
   };
   static add(id, def) {
      return new this(id, def);
   };
   static get(id) {
      const l = this.active.find(l => l.id === id);
      if (!l) throw Error(`No listener found for the ${id} id.`);
      return l;
   };
   static remove(id) {
      this.get(id).delete();
   };
   static createInputPanel() {
      const $grd = $(`<div class='keyInputPanel'>`);

      if (this.active.length) {
         this.active.forEach(kb => $grd.append(kb.createInputContext()));
      } else {
         $grd.append(`<span>No active key bindings.</span>`);
      }
      return $grd;
   };
   static openInputDialog() {
      if (!Dialog) throw new Error(`KeyControl.openInputDialog() can only be used with the Sugarcube story format.`);
      Dialog.setup('Input panel', 'keyInputDialog');
      return Dialog.append(this.createInputPanel()).open();
   }
};

$(document).on('keydown.KeyControlAPI', e => KeyControl.run(e));

$('#style-story').before(`<style id='KeyControlStyling'>
.keyInputPanel {display:grid;}
.keyWrapper {display: grid;grid-template-columns: 1fr 2fr 1fr;gap: 1em;padding: .5em;}
</style>`);

/* End of the API */
