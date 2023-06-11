window.Update = {
  markupParser : function (txt) {
    const matches = txt.match(/{{(?:.*?}})/g);
    if (matches) {
      matches.forEach(m => {
        const inner = m.slice(2,-2), id = 'var-upd-'+this.counter;
        this.targets.push({content : inner, id : id, value : State.getVar(inner)}); 
        txt = txt.replace(m, `<span id='${id}' class='updateWrapper'>${inner}</span>`);
        this.counter++;
      });
    }
    return txt;
  },
  targetCleaner : function() { //Clean the pool of values to compare if the wrapper isn't on page!
    this.targets.forEach(v => {
      if (!$.contains(document.body, $('#'+v.id)[0])){
        this.targets.delete(v);
      } else {
        console.log(`Document contains ${v.id}`);
      }
    });
  },
  targetCompare : function() {
    if (this.targets.length) {
      setTimeout(()=> {
        this.targets.forEach(v => {
          const newVal = State.getVar(v.content);
          if (newVal !== v.value) {$('#'+v.id).text(newVal)};
          v.value = newVal;
        });
      });
    }
  },
  targets : [],
  counter : 0
};

$(document).on('click change refreshUpdateContainers', Update.targetCompare.bind(Update)).on(':passageend', Update.targetCleaner.bind(Update));

Config.passages.onProcess = function(p) {
  //Use onProcess as usual, just make sure the final output is processed for markup parsing...
	return Update.markupParser(p.text);
};
