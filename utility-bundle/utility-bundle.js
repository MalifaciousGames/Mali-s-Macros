/* ----------------------- UTILITY BUNDLE ----------------------- */
/* ------------------- ONLY ONE COPY NEEDED! -------------------- */

window.MalisMacros = {
  	wikiWrapper : function(varCopy, callback) {
		const copies = {};
      	if (typeof varCopy === 'object') {
        	$.each(varCopy, (key, value) => {
            	copies[key] = State.temporary?.[key];
              	State.temporary[key] = value;
        	});
		}
		try {
        	callback();
		} finally {
			$.each(copies, (key, value) => {
              	State.temporary[key] = value;
        	})
      	};
    },
  	on_macro_events : [],
	version : '1.0'
}

Array.prototype.attrFinder = function (match, elem) {
  	const ind = this.indexOf(match);
  	if (ind !== -1) {
		const [attr] = this.deleteAt(ind+1);
		this.delete(match);
      	if (elem) {elem.attr(`data-${match}`, attr)};
		return attr;
    }
    return false;
};

//Create object from macro payloads with tag as keys
Array.prototype.payloadsToObj = function () {
	const payloads = {default : this[0].contents}; //Default doesn't have its args on purpose
	this.slice(1).forEach(pay => {
		payloads[pay.name] = pay;
	});
	return payloads;
};

//Unpacks non-primitive values into attribute arrays
Array.prototype.unpack = function () {
	let i = 0, attributes = this;
	while (i < attributes.length) {
		const attr = attributes[i];
		if (Array.isArray(attr)) {//Array of pairs
			attributes.deleteAt(i)[0].forEach((el) => attributes.push(el));
		} else if (typeof attr === 'object' && !attr.isLink){//JQ-style object, provision for goto [[passage]]
			$.each(attributes.deleteAt(i)[0] , (key, value)=> {
				attributes.push(key.toLowerCase());
				attributes.push(value);
            });
		} else {i++}
	}
	if (attributes.length%2) throw new Error(`Non-object arguments should always come in pairs. ${attributes.includes('disabled') ? "Even the 'disabled' attribute." : ''}`);
	return attributes;
};

//Apply array of property/value pairs to element
$.fn.extend({
	applyAttr: function(attributes) {
		for (let i = 0; i < attributes.length;i+=2) {
			this.attr(attributes[i], attributes[i+1]);
		};
      return this;
    },
	runOutput : function(name, payload) {
		if (payload) {
        	switch(name) {
              case 'rep': $(payload.args[0] ?? this.parent()).empty().wiki(payload.contents); break;
              case 'prep': $(document.createDocumentFragment()).wiki(payload.contents).prependTo(payload.args[0] ?? this.parent()); break;
              case 'app': $(payload.args[0] ?? this.parent()).wiki(payload.contents);break;
              case 'diag': 
                Dialog.setup(payload.args?.[0], payload.args?.[1]);
                Dialog.wiki(payload.contents);
                Dialog.open();
                break;
              case 'refresh': this.empty().wiki(payload); break;
              default : $.wiki(payload);
           }
		}
    },
  	diagFrom : function(x, y) {
		const PosY = this.offset().top - this.height()/2, PosX = this.offset().left - this.width()/2;
		return { distance : Math.hypot(PosY - y, PosX - x), top : y - PosY, left : x - PosX};
    }
});

/* ------------------- END OF UTILITY BUNDLE -------------------- */
