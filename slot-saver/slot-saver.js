//slotToFile macro and utility functions
//download a specific save slot as a save file

(() => {
   function getTimeStamp() {
      const [_, d] = new Date().toJSON(), [m, date, hour] = d.match(/(.+)T(.+)(?=\.)/);
      return date + '-' + hour;
   };

   function slotToFile(slot) {
      let saveObject, title;

      if (slot === 'auto') {
         if (!Config.saves.autosave) throw new Error('Autosave is disabled for this story.');
         if (!Save.autosave.has()) return UI.alert('No autosave available.');

         saveObject = Save.autosave.get();
         title = `${Story.domId}-${getTimeStamp()}.save`;

      } else {

         if (typeof slot !== 'number') throw new Error(`Slot parameter must be a number between 0 and ${Save.slots.length}.`);
         if (!Save.slots.has(slot)) return UI.alert(`No save slot at ${slot}.`);

         saveObject = Save.slots.get(slot);
         title = `${Story.domId}-slot${slot}-${getTimeStamp()}.save`;

      }

      saveObject = JSON.stringify(saveObject);
      saveAs(new Blob([LZString.compressToBase64(saveObject)], { type: 'text/plain;charset=UTF-8' }), Util.sanitizeFilename(title));

   };

   Macro.add('slotToFile', {
      handler() {
         slotToFile(this.args[0]);
      }
   });

   //to setup
   setup.saveUtils = {
      getTimeStamp, slotToFile
   };

})();