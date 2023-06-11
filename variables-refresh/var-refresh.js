window.Update = {
  	markupParser : function (txt) {
    	const matches = txt.match(/{{(?:.*?}})/g);
  		if (matches) {
        	matches.forEach(m => {
            	const inner = m.slice(2,-2), id = 'var-upd-'+this.counter;
            	txt = txt.replace(m, `<span id='${id}' class='updateWrapper'></span>`);
              
              	setTimeout(()=>{
                  const val = State.getVar(inner);
                  $('#'+id).text(val);
                  this.targets.push({content : inner, id : id, value : val}); 
                });
              
          		this.counter++;
        	});
    	}
		return txt;
    },
  	targetCleaner : function() { //Clean the pool of values to compare if the wrapper isn't on page!
    	this.targets.forEach(v => {
          if (!$.contains(document.body, $('#'+v.id)[0])){
            this.targets.delete(v);
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
