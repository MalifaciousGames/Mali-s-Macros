/* Mali's achievements API and macros for Sugarcube */

(() => {
   let toSlug;
   try { toSlug = createSlug } catch { toSlug = Util.slugify };

   const anim = steps => {
      for (const k in steps) setTimeout(steps[k], k);
   };

   window.Achievement = class Achievement {
      constructor(id, def) {

         if (typeof id !== 'string') throw new Error(`Invalid Achievement declaration, ID needs to be a string, is a ${typeof id} instead.`);

         this.id = toSlug(id);

         Object.assign(this, {
            name: {
               locked: '???',
               unlocked: id // name defaults to un-slugified id
            },
            view: {
               locked: `Achievement locked.`,
               unlocked: `Achievement unlocked.`
            }
         }, def);

         // set default message
         this.message ||= 'Achievement unlocked : ' + this.name.unlocked;

         Achievement.definitions[this.id] = this;
      }

      lock() {
         Achievement.state[this.id] = false;
         Achievement.commit();
      }

      unlock(showPopUp = true) {
         if (Achievement.state[this.id]) return;

         Achievement.state[this.id] = true;
         Achievement.commit();

         if (showPopUp) this.notify();
      }

      display() {
         const locked = !Achievement.state[this.id];

         return $('<div>')
            .attr({
               class: `achievement ${this.id} ${locked ? 'locked' : ''} ${this.class || ''}`,
               id: 'achiev-' + this.id
            })
            .append(`<span class='achiev-name'>${locked ? this.name.locked : this.name.unlocked}</span>`)
            .wiki(`<span class='achiev-inner'>${locked ? this.view.locked : this.view.unlocked}</span>`);
      }

      toDialog() {
         Dialog.setup();
         Dialog.append(this.display()).open();
      }

      notify() {

         const $ntf = $('<span>')
            .attr({
               class: `achiev-hidden achiev-notif ${this.id} ${this.class || ''}`
            })
            .wiki(this.message)
            .appendTo(Achievement.notifBox);

         anim({
            0: () => $ntf.removeClass('achiev-hidden'),
            3000: () => $ntf.addClass('achiev-hidden'),
            4000: () => $ntf.remove()
         });

      }

      static memID = 'achievements-API';

      static definitions = {};
      static state = recall(this.memID, {});

      // a function to iterate over defined achievements
      static each(cb) {
         for (const k in this.definitions) {
            const def = this.definitions[k], value = this.state[k];
            cb.call(Achievement, def, value);
         }
      };
      static get(id) { return this.definitions[toSlug(id)] };

      static commit() { memorize(this.memID, this.state) }

      static clearAll() {
         this.state = {};
         this.commit();
      }

      static unlockAll() {
         this.each(def => def.unlock());
      }

      static check(...ids) {
         return ids.some(id => this.state[toSlug(id)]);
      }

      static displayAll(inDialog) {

         const $inner = $('<div>').addClass('achiev-view-inner');

         this.each(def => $inner.append(def.display()));

         if (!$inner.children().length) $inner.append('...there are no defined achievements for this game...');

         if (inDialog) {
            Dialog.setup('Achievements');
            return Dialog.append($inner).open();
         }

         return $('<div>').addClass('achievements-view').append(`<h2>Achievements</h2>`, $inner);
      };

      static notifBox = $('<div>').attr({ id: 'notification-container' }).appendTo('body');

      static get unlocked() {
         const unl = [];

         for (const k in this.state) {
            if (this.state[k]) unl.push(k);
         }
         return unl;
      }

      static get defined() {
         return Object.keys(this.defined);
      }

   };

   Macro.add(['new-achievement', 'new-achiev'], {
      tags: ['locked', 'message'],
      handler() {

         // handy payload object
         const payload = {};
         this.payload.forEach(p => {
            payload[p.name] = {
               args: p.args,
               contents: p.contents
            };
         });

         const def = {
            name: {
               unlocked: this.args[1] || this.args[0],
               locked: payload.locked?.args[0] || '???'
            },
            class: this.args[2],
            view: {
               unlocked: this.payload[0].contents || `Achievement unlocked.`,
               locked: payload.locked?.contents || `Achievement locked.`
            },
            message: payload.message?.contents
         };

         new Achievement(this.args[0], def);
      }
   });

   Macro.add(['achievement', 'achiev'], {
      handler() {

         let [id, command = 'display'] = this.args, def = Achievement.get(toSlug(id));

         if (!def) return this.error(`No achievement found for id "${id}", make sure it is defined in StoryInit.`);

         command = command.toLowerCase();
         switch (command) {
            case 'display': return def.display().appendTo(this.output);
            case 'dialog': return def.toDialog();
            case 'unlock': case 'lock': return def[command]();
            default: return this.error(`"${command}" is not a valid command.`);
         }

      }
   });

   Macro.add(['achievements-display', 'achievements-dialog'], {
      handler() {
         if (this.args[0] || this.names.includes('dialog')) return Achievement.displayAll(true);

         Achievement.displayAll().appendTo(this.output);
      }
   });

   // exported saves try to pass the achievements as they might be loaded from another URL

   Save.onSave.add((save, dt) => {
      const toDisk = save.hasOwnProperty('type') ? save.type === 'disk' : dt.type === 'disk';
      if (toDisk) {
         save.metadata ??= {};
         save.metadata.achievements = Achievement.state;
      }
   });

   Save.onLoad.add(save => {
      const achv = save.metadata?.achievements;
      if (achv) {
         for (const k in achv) {
            if (achv[k]) Achievement.state[k] = achv[k];
         }
         Achievement.commit();
      }
   })

})();

/* End of achievements script */