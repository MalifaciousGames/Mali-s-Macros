/* ----------------------- UTILITY BUNDLE ----------------------- */
/* ------------------- ONLY ONE COPY NEEDED! -------------------- */

window.MalisMacros={wikiWrapper:function(t,e){const r={};"object"==typeof t&&$.each(t,((t,e)=>{r[t]=State.temporary?.[t],State.temporary[t]=e}));try{e()}finally{$.each(r,((t,e)=>{State.temporary[t]=e}))}},on_macro_events:[],version: '1.0'},Array.prototype.attrFinder=function(t,e){const r=this.indexOf(t);if(-1!==r){const[a]=this.deleteAt(r+1);return this.delete(t),e&&e.attr(`data-${t}`,a),a}return!1},Array.prototype.payloadsToObj=function(){const t={default:this[0].contents};return this.slice(1).forEach((e=>{t[e.name]=e})),t},Array.prototype.unpack=function(){let t=0,e=this;for(;t<e.length;){const r=e[t];Array.isArray(r)?e.deleteAt(t)[0].forEach((t=>e.push(t))):"object"!=typeof r||r.isLink?t++:$.each(e.deleteAt(t)[0],((t,r)=>{e.push(t.toLowerCase()),e.push(r)}))}if(e.length%2)throw new Error("Non-object arguments should always come in pairs. "+(e.includes("disabled")?"Even the 'disabled' attribute.":""));return e},$.fn.extend({applyAttr:function(t){for(let e=0;e<t.length;e+=2)this.attr(t[e],t[e+1]);return this},runOutput:function(t,e){if(e)switch(t){case"rep":$(e.args[0]??this.parent()).empty().wiki(e.contents);break;case"prep":$(document.createDocumentFragment()).wiki(e.contents).prependTo(e.args[0]??this.parent());break;case"app":$(e.args[0]??this.parent()).wiki(e.contents);break;case"diag":Dialog.setup(e.args?.[0],e.args?.[1]),Dialog.wiki(e.contents),Dialog.open();break;case"refresh":this.empty().wiki(e);break;default:$.wiki(e)}},diagFrom:function(t,e){const r=this.offset().top-this.height()/2,a=this.offset().left-this.width()/2;return{distance:Math.hypot(r-e,a-t),top:e-r,left:t-a}}});

/* ------------------- END OF UTILITY BUNDLE -------------------- */

/*-------------------- Mali's drag and drop Macro -----------------------*/

Macro.add('drop', {
	isAsync : true,
	tags : ['onEnter','onLeave','onDrop','onRemove','onAny'],
  
	handler() {
      	if (window.MalisMacros === undefined) return this.error(`<<${this.name}>> needs a utility bundle to function! It can be downloaded there: url . Much love, Maliface!`);
		  
		const elemType = this.args[0],
			attributes = this.args.slice(1).unpack(),
            payloads = this.payload.payloadsToObj(),
            innerContent = payloads.default,
            dropElem = $(`<${elemType || 'div'}/>`).wiki(innerContent);
		  
		let dropMode = null, dropParam = payloads.onDrop?.args[0]?.toLowerCase() ?? null, initSlots, slots, ID;
	  	
      	const countSlots = (num) => {
        	const elems = dropElem.children('[data-size]').toArray(), occupied = elems.reduce((acc,el) => {return acc + Number($(el).attr('data-size'))}, 0);
            dropElem.attr('data-slots', (initSlots-occupied));
          	return num ? (num-occupied) : (initSlots-occupied);
        };
      
		//Catch slots property
		if (attributes.includes('slots')){
			const slotProp = attributes.attrFinder('slots');
          
			if (typeof slotProp === 'string' && slotProp.includes('/')){ //Taylored version
				slots = Number(slotProp.split('/')[1] - slotProp.split('/')[0]);
                initSlots = Number(slotProp.split('/')[1]);
            	dropElem.attr('data-slots', slots);
			} else { //Loose logic
              	initSlots = Number(slotProp);
              	slots = countSlots(initSlots);
			}
		}
      
		//Invalid dropMode
      	if (dropParam){
      		if (typeof dropParam === 'string') {//Param is non-empty string
            	if (dropParam === 'fillswap' && slots === undefined){
                	return this.error(`The 'fillswap' drop mode needs a 'slots' property to work.`);
                } else if (['append', 'prepend', 'replace','replaceall', 'swap','none','anywhere','remove','fillswap'].includes(dropParam.toLowerCase())) {//Is one of the drop modes
            		dropMode = dropParam;
            	} else {//Is an expression
          	  		dropParam = {type: 'exp', content : dropParam};
            	}
        	} else if (typeof dropParam === 'function') {//Is a function
				dropParam = {type: 'func', content : dropParam};
       		} else {//Some truthy value of the wrong type!
        		return this.error(`Drop mode (<<onDrop mode>>) is not valid, reading: '${dropMode}'`);
        	}
        }
		
		ID = attributes.attrFinder('type');
		
		//Apply attributes
		dropElem.applyAttr(attributes).addClass(`macro-${this.name}`);
		
      	//Set up type container properties
		if (ID){
			dropElem.data('drop-type', ID).addClass(`drop-type-${ID}`)
		}
		  
		//Finds the closest existing element in the drop target
		function findClosest(e,dragElem) {
			const chi = dropElem.children().filter('.macro-drag');
			if (!chi.length) {//Drop doesn't have children
				return null;
			} else {//Other drag macros in there
				const dif = [];
				for (let i = 0; i < chi.length; i++){
					//Get index + diagonal distance
					const result = $(chi[i]).diagFrom(e.pageX, e.pageY);
                  	result.elem = $(chi[i]);

					dif.push(result);
				}
				//Return closest one
              	return dif.sort((a,b)=> a.distance - b.distance)[0];
			}
		}
		  
		//Draggable is dragged out of container
		  dropElem.on('dragstart', this.createShadowWrapper((e) => {
				const dragElem = State.temporary.drag;
				  
				//Wait for the ':predrop' event to validate the move
				$(document).off(':predrop');//Clean previously set listeners, stops improper drags from running the removal code!
				$(document).one(':predrop', this.createShadowWrapper((e) => {
					$.wiki(payloads.onRemove?.contents + payloads.onAny?.contents);
					if (slots !== undefined) {slots = countSlots()}; //Refund slots!
				 }));
			  }
		  )).on('drop touchstart', this.createShadowWrapper(
			(e) => {
              	e.preventDefault();
				const dragElem = State.temporary.drag;
              
              	//_drag isn't set / don't trigger self drop on touch events
              	if (dragElem === undefined || (e.type === 'touchstart' && dragElem.origin.is(dropElem))) return false;

              	//Wrong type
              	if (ID && dragElem.type !== ID){ $(e.target).trigger(':typemismatch'); return false;}
              	
              	//Eval the dropParam expression/run the function if needed
      			if (dropParam?.type){
        			dropParam.type === 'exp' ? dropMode = eval(parse(dropParam.content)) : dropMode = dropParam.content.call(this);
        		} else if (dropParam === 'fillswap') {
                	dropMode = slots - dragElem.size <= 0 ? 'swap' : 'fill' ;
				}
              
              	//No slots available
              	if (slots - dragElem.size < 0 && dropMode !== 'swap'){$(e.target).trigger(':noslots');return false;}
  				
				//Confirm target removal
				$(e.target).trigger({type : ':predrop', slots : slots, mode : (e.origin ?? dropMode)});
				$.wiki(payloads.onDrop?.contents + payloads.onAny?.contents);
  
				const target = findClosest(e, dragElem);
  
				switch (dropMode){
				case 'prepend': case 'append':
					dropElem[dropMode](dragElem.self);
				break;
                case 'swap':
					//Drag elem to container
					if (target === null || e.origin === 'swap') {
						//Only child, no element to swap
						dropElem.append(dragElem.self);
					} else {
						target.elem[target.left < 0 ? 'before' : 'after'](dragElem.self);
						if (e.origin !== 'swap'){
							//Avoid infinite swap loop!
							target.elem.trigger('dragstart'); // Trigger dragstart on the element being replaced to set _drag
							$(dragElem.origin).trigger({type : 'drop', origin : 'swap'}); // Trigger a drop on the original zone to send the element back to it
							setTimeout(() => { target.elem.show() }); //Show it again
						}
					}
				break;        
				case 'remove':
					dragElem.self.remove();
				break;         
				case 'none':break;        
				case 'replace':
					dropElem.append(dragElem.self);
					if (target !== null && ! target.elem.is(dragElem.self)) {
						//Run removal code on target
						target.elem.trigger('dragstart');
						dropElem.trigger(':predrop');
						target.elem.remove();
					}
				break;         
				case 'replaceall':
					dropElem.empty().append(dragElem.self);
				break;         
				default:
					if (target === null) {
						dropElem.append(dragElem.self);
					} else {
						target.elem[target.left < 0 ? 'before' : 'after'](dragElem.self);
					}
				}
              
              	if (slots !== undefined){slots = countSlots()};
  
				//Trigger related event
				$(e.target).trigger(':postdrop');
              	if (e.type === 'touchstart') {
              		$('.macro-drag.selected').removeClass('selected');
                }

			})).on('dragenter', this.createShadowWrapper((e) => {
            	e.preventDefault();
                //Has entered from another container
                if (!State.temporary.drag?.origin.is(dropElem)) {$.wiki(payloads.onEnter?.contents);}	  
			})).on('dragover', (e) => {
          		e.preventDefault();
        	}).on('dragleave', this.createShadowWrapper((e) => {
            	e.preventDefault();
                //Has left from this container
                if (State.temporary.drag?.origin.is(dropElem)) {$.wiki(payloads.onLeave?.contents);}
			})).appendTo(this.output);
	}
});
  
/*-------------------- Drag Macro -----------------------*/
												   
Macro.add('drag', {
	isAsync : true,
	tags : ['onEnd','onStart', 'data'],
  
	handler() {
      
      if (window.MalisMacros === undefined) return this.error(`Macro '<<${this.name}>>' needs a utility bundle to function! It can be downloaded there: url .\nb Much love, Maliface!`);
		  
		const attributes = this.args.slice(1).unpack(),
        	payloads = this.payload.payloadsToObj(),
			dragElem = $(`<${this.args[0] || 'span'}/>`).wiki(payloads.default),
			ID = attributes.attrFinder('type', dragElem),
            dropMode = attributes.attrFinder('dropMode', dragElem),
			size = attributes.attrFinder('size', dragElem);

      	//Apply properties
		dragElem.applyAttr(attributes).attr({'draggable':'true','data-size': size || 1}).addClass(`macro-${this.name}`);
		
      	//Special set up if type is supplied
		if (ID){ dragElem.data('drag-type', ID).addClass(`drag-type-${ID}`)}
      
      	//Make all descendants draggable=false
      	dragElem.find('*').prop('draggable', false);
		  
		let oldData;

		dragElem.on('dragstart touchstart', this.createShadowWrapper((e) => {
                  
				if (e.type === 'touchstart') {
					$(e.target).parent().trigger('dragstart');
                    $('.macro-drag.selected').removeClass('selected');
                    $(e.target).addClass('selected');
                    e.stopPropagation();
                } else {
                	//Hide static copy when dragged
					setTimeout(() => {$(e.target).hide()});
				}
                
          		oldData = clone(State.temporary.drag);
          
				//Create _drag object
				State.temporary.drag = {
					type : ID,
					self : dragElem,
					size : (size ?? 1),
					data : (payloads.data?.args[0] ?? null),
					contents : payloads.default,
					origin : $(e.target).parent(),
					originIndex :  $(e.target).index()
				};
  
				//Wikify associated payload
				$.wiki(payloads?.onStart);
          
			})).on('dragend', this.createShadowWrapper((e) => {
          		$.wiki(payloads?.onEnd);
          
				//Reset _drag to former value
				oldData === undefined ? delete State.temporary.drag : State.temporary.drag = oldData;
  
				//Show element again
				$(e.target).show();
			})).appendTo(this.output);
	}
});
