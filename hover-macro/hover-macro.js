/* ----------------------- UTILITY BUNDLE ----------------------- */
/* ------------------- ONLY ONE COPY NEEDED! -------------------- */

window.MalisMacros={wikiWrapper:function(t,e){const r={};"object"==typeof t&&$.each(t,((t,e)=>{r[t]=State.temporary?.[t],State.temporary[t]=e}));try{e()}finally{$.each(r,((t,e)=>{State.temporary[t]=e}))}},on_macro_events:[],version: '1.0'},Array.prototype.attrFinder=function(t,e){const r=this.indexOf(t);if(-1!==r){const[a]=this.deleteAt(r+1);return this.delete(t),e&&e.attr(`data-${t}`,a),a}return!1},Array.prototype.payloadsToObj=function(){const t={default:this[0].contents};return this.slice(1).forEach((e=>{t[e.name]=e})),t},Array.prototype.unpack=function(){let t=0,e=this;for(;t<e.length;){const r=e[t];Array.isArray(r)?e.deleteAt(t)[0].forEach((t=>e.push(t))):"object"!=typeof r||r.isLink?t++:$.each(e.deleteAt(t)[0],((t,r)=>{e.push(t.toLowerCase()),e.push(r)}))}if(e.length%2)throw new Error("Non-object arguments should always come in pairs. "+(e.includes("disabled")?"Even the 'disabled' attribute.":""));return e},$.fn.extend({applyAttr:function(t){for(let e=0;e<t.length;e+=2)this.attr(t[e],t[e+1]);return this},runOutput:function(t,e){if(e)switch(t){case"rep":$(e.args[0]??this.parent()).empty().wiki(e.contents);break;case"prep":$(document.createDocumentFragment()).wiki(e.contents).prependTo(e.args[0]??this.parent());break;case"app":$(e.args[0]??this.parent()).wiki(e.contents);break;case"diag":Dialog.setup(e.args?.[0],e.args?.[1]),Dialog.wiki(e.contents),Dialog.open();break;case"refresh":this.empty().wiki(e);break;default:$.wiki(e)}},diagFrom:function(t,e){const r=this.offset().top-this.height()/2,a=this.offset().left-this.width()/2;return{distance:Math.hypot(r-e,a-t),top:e-r,left:t-a}}});

/* ------------------- END OF UTILITY BUNDLE -------------------- */

/* Mali's <<hover>> macro for Sgarcube*/

Macro.add('hover', {
	tags : ['swap','tip'],
	
	handler() {
	if (window.MalisMacros === undefined) return this.error(`<<${this.name}>> needs a utility bundle to function! It can be downloaded there: https://github.com/MalifaciousGames/Mali-s-Macros/blob/main/utility-bundle/utility-bundle-min.js . Much love, Maliface!`);
      	const payloads = this.payload.payloadsToObj(this.self.tags),
              hasTip = payloads?.tip ? true : false,
              hasSwap = payloads?.swap ? true : false,
              contAttr = this.args.slice(1).unpack();

		if (hasSwap && payloads.swap.contents.trim() === '') return this.error('<<swap>> tag needs to have content.');
		
		//Create outer + inner container
		const container = $(document.createElement(this.args[0]||'span')),
			innerCont = $('<span>').wiki(this.payload[0].contents).addClass('macro-hover-inner');
		
		// Catch capture mode!
		const capture = contAttr.attrFinder('capture');

		container.applyAttr(contAttr).append(innerCont);
		
		if (hasTip) {//Create tip elem, add attributes
			var tipElem = $('<span>').applyAttr(payloads.tip.args.unpack()).addClass('macro-hover-tip');
			if (capture) {tipElem.wiki(payloads.tip.contents)};
			container.append(tipElem);
		}
		
		if (hasSwap && capture) {
			var shadowSwap = $(document.createDocumentFragment()).wiki(payloads.swap.contents),
				shadowCont = $(document.createDocumentFragment()).wiki(this.payload[0].contents);	
		}

		$(container).hover(this.createShadowWrapper(() => {//In
			if (hasSwap) {
				innerCont.empty();
				capture ? innerCont.append(clone(shadowSwap)) : innerCont.wiki(payloads.swap.contents);
			}
			if (hasTip && !capture) {
				tipElem.empty().wiki(payloads.tip.contents);
			}
		}),
		this.createShadowWrapper(() => {//Out
			if (hasSwap) {
				innerCont.empty();
				capture ? innerCont.append(clone(shadowCont)) : innerCont.wiki(this.payload[0].contents);
			}
		})).addClass('macro-hover').appendTo(this.output);
	}
});
