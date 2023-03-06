/* ----------------------- UTILITY BUNDLE ----------------------- */
/* ------------------- ONLY ONE COPY NEEDED! -------------------- */

window.MalisMacros={wikiWrapper:function(t,e){const r={};"object"==typeof t&&$.each(t,((t,e)=>{r[t]=State.temporary?.[t],State.temporary[t]=e}));try{e()}finally{$.each(r,((t,e)=>{State.temporary[t]=e}))}},on_macro_events:[]},Array.prototype.attrFinder=function(t,e){const r=this.indexOf(t);if(-1!==r){const[a]=this.deleteAt(r+1);return this.delete(t),e&&e.attr(`data-${t}`,a),a}return!1},Array.prototype.payloadsToObj=function(){const t={default:this[0].contents};return this.slice(1).forEach((e=>{t[e.name]=e})),t},Array.prototype.unpack=function(){let t=0,e=this;for(;t<e.length;){const r=e[t];Array.isArray(r)?e.deleteAt(t)[0].forEach((t=>e.push(t))):"object"!=typeof r||r.isLink?t++:$.each(e.deleteAt(t)[0],((t,r)=>{e.push(t.toLowerCase()),e.push(r)}))}if(e.length%2)throw new Error("Non-object arguments should always come in pairs. "+(e.includes("disabled")?"Even the 'disabled' attribute.":""));return e},$.fn.extend({applyAttr:function(t){for(let e=0;e<t.length;e+=2)this.attr(t[e],t[e+1]);return this},runOutput:function(t,e){if(e)switch(t){case"rep":$(e.args[0]??this.parent()).empty().wiki(e.contents);break;case"prep":$(document.createDocumentFragment()).wiki(e.contents).prependTo(e.args[0]??this.parent());break;case"app":$(e.args[0]??this.parent()).wiki(e.contents);break;case"diag":Dialog.setup(e.args?.[0],e.args?.[1]),Dialog.wiki(e.contents),Dialog.open();break;case"refresh":this.empty().wiki(e);break;default:$.wiki(e)}},diagFrom:function(t,e){const r=this.offset().top-this.height()/2,a=this.offset().left-this.width()/2;return{distance:Math.hypot(r-e,a-t),top:e-r,left:t-a}}});

/* ------------------- END OF UTILITY BUNDLE -------------------- */

/* Mali's <<a>> macro for Sugarcube */

Macro.add(['a','adel','but','butdel'], {
	isAsync : true,
	tags    : ['rep','prep','app','diag'],

	handler() {
      
		const type = this.name[0] === 'b' ? 'button' : 'link',
		      attributes = this.args.slice(1).unpack(),
		      payloads = this.payload.payloadsToObj(this.self.tags);

      	let oldThis, passage, setter, linkContent = this.args[0], link = $(`<${type === 'button'? type : 'a'}>`);
		
		//Process bracket syntax
      	if (typeof linkContent === 'object'){
        	if (linkContent.setFn){//Has a setter
        		setter = linkContent.setFn;
        	}
        	if (linkContent.isImage) {//[img[url][passage]]
            	passage = linkContent?.link;
				linkContent = `<img src=${linkContent.source} class=link-image>`;
			} else {//[[Text|passage]]
              	passage = linkContent.link;
				linkContent = linkContent.text;
			}
        }
      
      	// Catch choice property
      	if (attributes.includes('choice')){
			var choiceID = attributes.attrFinder('choice', link);
          	choiceID = choiceID.split(',');
		};
      
      	// Catch trigger property
      	if (attributes.includes('trigger')){
			var trig = attributes.attrFinder('trigger').split(',').map(e => e.trim());
		};
      
      	// Catch goto property
		passage = attributes.attrFinder('goto');
      	
      	// Catch key property
		if (attributes.includes('key')){
			var keyArray = attributes.attrFinder('key', link);
          	keyArray = keyArray.split(',');

          	$(document).keyup('macro-a-key', (e) => {
				keyArray.every(key => {
					if (e[isNaN(Number(key)) ? 'key' : 'keyCode'] == key){
						e.preventDefault();
						link.click();
						return false; //Stops the every()
						//Makes sure it runs only once even if redundant keys are given
					}
					return true;
				})
			})
		};
          
      	link.applyAttr(attributes);
      
      	// Process passage links like SC's link macro would
      	if (passage) {
          	if (typeof passage === 'object') {
            	passage = passage.link;
            }
          	link.attr('data-passage', passage);
        	if (Story.has(passage)) {
				link.addClass('link-internal');
				if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
					link.addClass('link-visited');
				}
			} else {
				link.addClass('link-broken');
			}
        };

		// Wiki link text
		link.wikiWithOptions({ profile : 'core' }, linkContent).addClass(`macro-${this.name} link-internal`);

      	link.ariaClick( //Options object
			{namespace : '.macros',
			role : type ,
			one : (this.name.length > 3 || passage) ? true : false},
        this.createShadowWrapper(
          MalisMacros.wikiWrapper.bind(this, {'link' : link},
			function() { // Main call with wikiWrapper
        		if (setter) {setter()};
				$.each(payloads, (key, pay) => {
            		link.runOutput(key, pay);
            	});
				if (trig) {
                	trig.forEach(e => {
                    	$(document).trigger(e)
                    })
                };
			}),
          
        	function() { // After call
				if (passage){ //Go to passage
					Engine.play(passage);
				} else if (this.name.length > 3){ //Remove link
					link.remove();
				}
            	if (choiceID){
            		choiceID.forEach(id => { $(`[data-choice*=${id}]`).not(link).remove() });
            	}
			})
      ).appendTo(this.output);
	}
});
