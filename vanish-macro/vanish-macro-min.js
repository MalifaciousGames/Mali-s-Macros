/* ----------------------- UTILITY BUNDLE ----------------------- */
/* ------------------- ONLY ONE COPY NEEDED! -------------------- */

window.MalisMacros={wikiWrapper:function(t,e){const r={};"object"==typeof t&&$.each(t,((t,e)=>{r[t]=State.temporary?.[t],State.temporary[t]=e}));try{e()}finally{$.each(r,((t,e)=>{State.temporary[t]=e}))}},on_macro_events:[],version: '1.0'},Array.prototype.attrFinder=function(t,e){const r=this.indexOf(t);if(-1!==r){const[a]=this.deleteAt(r+1);return this.delete(t),e&&e.attr(`data-${t}`,a),a}return!1},Array.prototype.payloadsToObj=function(){const t={default:this[0].contents};return this.slice(1).forEach((e=>{t[e.name]=e})),t},Array.prototype.unpack=function(){let t=0,e=this;for(;t<e.length;){const r=e[t];Array.isArray(r)?e.deleteAt(t)[0].forEach((t=>e.push(t))):"object"!=typeof r||r.isLink?t++:$.each(e.deleteAt(t)[0],((t,r)=>{e.push(t.toLowerCase()),e.push(r)}))}if(e.length%2)throw new Error("Non-object arguments should always come in pairs. "+(e.includes("disabled")?"Even the 'disabled' attribute.":""));return e},$.fn.extend({applyAttr:function(t){for(let e=0;e<t.length;e+=2)this.attr(t[e],t[e+1]);return this},runOutput:function(t,e){if(e)switch(t){case"rep":$(e.args[0]??this.parent()).empty().wiki(e.contents);break;case"prep":$(document.createDocumentFragment()).wiki(e.contents).prependTo(e.args[0]??this.parent());break;case"app":$(e.args[0]??this.parent()).wiki(e.contents);break;case"diag":Dialog.setup(e.args?.[0],e.args?.[1]),Dialog.wiki(e.contents),Dialog.open();break;case"refresh":this.empty().wiki(e);break;default:$.wiki(e)}},diagFrom:function(t,e){const r=this.offset().top-this.height()/2,a=this.offset().left-this.width()/2;return{distance:Math.hypot(r-e,a-t),top:e-r,left:t-a}}});

/* ------------------- END OF UTILITY BUNDLE -------------------- */

/* Mali's <<vanish>> macro for Sgarcube */
Macro.add('vanish',{tags:null,handler(){if(window.MalisMacros===undefined){return this.error(`<<${this.name }>> needs a utility bundle to function! It can be downloaded there: https://github.com/MalifaciousGames/Mali-s-Macros/blob/main/utility-bundle/utility-bundle-min.js . Much love, Maliface!`)}if(!this.args[0]){return this.error('<<vanish>> needs either a delay or an event argument.')}const needsEvent=/\b[0-9]/.test(this.args[0])?false:true;const wrapper=$(document.createElement(this.args[1]||'span')),hide=()=>{wrapper.removeClass('macro-vanish-visible').addClass('macro-vanish-hidden').css('pointer-events','none').find('a, button').ariaDisabled(true).attr('tabindex','-5')},fadeout=()=>{wrapper.animate({opacity:0},300,'swing',hide)};if(!needsEvent){var delay=Math.max(Engine.minDomActionDelay,Util.fromCssTime(this.args[0]));setTimeout(fadeout,delay)}else{$(document).one(this.args[0],fadeout)}wrapper.applyAttr(this.args.slice(2).unpack()).addClass('macro-vanish macro-vanish-visible').css('opacity',1).wiki(this.payload[0].contents).appendTo(this.output)}});