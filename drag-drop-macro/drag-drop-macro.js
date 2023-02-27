/*-------------------- Mali's drag and drop Macro -----------------------*/

Macro.add('drop', {
	isAsync : true,
	tags : ['onEnter','onLeave','onDrop','onRemove','onAny'],
  
	handler() {
		  
		const  elemType = this.args[0], attributes = this.args.slice(1);
		  
		const onEnter = this.payload.find(pay => pay.name === 'onEnter'),
			onLeave = this.payload.find(pay => pay.name === 'onLeave'),
			onAny = this.payload.find(pay => pay.name === 'onAny'),
			onDrop = this.payload.find(pay => pay.name === 'onDrop'),
			onRemove = this.payload.find(pay => pay.name === 'onRemove');
		  
		let dropMode = null, dropParam = onDrop?.args[0]?.toLowerCase() ?? null;
		const innerContent = this.payload[0].contents, dropElem = $(`<${elemType || 'div'}/>`).wiki(innerContent);
	  	
      		const countSlots = (num) => {
        		const elems = dropElem.children('[data-size]').toArray(), occupied = elems.reduce((acc,el) => {return acc + Number($(el).attr('data-size'))}, 0);
            		dropElem.attr('data-slots', (initSlots-occupied));
          		return num ? (num-occupied) : (initSlots-occupied);
        	};
      
		//Catch slots property
		if (attributes.includes('slots')){
			var initSlots = attributes.deleteAt([attributes.indexOf('slots')+1])[0];
          		attributes.delete('slots');
          
			if (typeof initSlots === 'string' && initSlots.includes('/')){ //Taylored version
				var slots = Number(initSlots.split('/')[1] - initSlots.split('/')[0]);
                		initSlots = Number(initSlots.split('/')[1]);
            			dropElem.attr('data-slots', slots);
			} else { //Loose logic
              			var slots = countSlots(initSlots);
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
		
      	//Catch type property 
		if (attributes.includes('type')){
			var ID = attributes.deleteAt([attributes.indexOf('type')+1])[0];
			attributes.delete('type');
          	dropElem.attr('data-type', ID);
		}

		//Apply attributes
		for (let i = 0; i < attributes.length;i++) {
			if (typeof attributes[i] === 'object'){// jQuery style object
				dropElem.attr(attributes[i]);
			} else { //Simple pair
				dropElem.attr( attributes[i], attributes[i+1]);
				i++
			}
		}
		
      	//Set up type container properties
		if (ID){
			dropElem.data('drop-type', ID).addClass(`drop-type-${ID}`)
		}
		  
		//Finds the closest existing element in the drop target
		function findClosest(e,dragElem) {
			const chi = dropElem.children();
			if (!chi.length) {
				//Drop doesn't have children
				return null;
			} else {
				//Object of objects
				const dif = [], x = e.pageX, y = e.pageY;
				for (let i = 0; i < chi.length; i++){
					//Get index + diagonal distance
					const PosY = $(chi[i]).offset().top + $(chi[i]).width()/2,
						PosX = $(chi[i]).offset().left + $(chi[i]).height()/2;
					  
					dif.push({
						diag : Math.hypot(Math.abs(PosY - y), Math.abs(PosX - x)) ,
						index : i ,
						offset : [PosX - x, PosY - y]
					});
				}
				//Find shortest distance
				const closest = dif.sort((a,b)=> a.diag - b.diag)[0];
				return [chi[closest.index], closest.offset];
			}
		}
		  
		//Draggable is dragged out of container
		  dropElem.addClass(`macro-${this.name}`)
		  	.on('dragstart', this.createShadowWrapper((e) => {
				const dragElem = State.temporary.drag;
				  
				//Wait for the ':predrop' event to validate the move
				$(document).off(':postdrop');//Clean previously set listeners, stops improper drags from running the removal code!
				$(document).one(':postdrop', this.createShadowWrapper((e) => {
					$.wiki(onRemove?.contents + onAny?.contents);

					if (slots !== undefined) {slots = countSlots()}; //Refund slots!
				 }));
			  }
		  )).on('drop touchstart', this.createShadowWrapper(
			(e) => {
              	e.preventDefault();
				const dragElem = State.temporary.drag;
              
              	//Stop touch event in current container from triggering a drop
              	if (e.type === 'touchstart' && dragElem.origin.is(dropElem)) {return false;}
              	
              	//Stops drops from happening if _drag isn't set
              	if (dragElem === undefined) {return false;}
				
              	//Wrong type
              	if (ID && dragElem.type !== ID){ $(e.target).trigger(':typemismatch');return false;}
              	
              	//Eval the dropParam expression/run the function if needed
      			if (dropParam?.type){
        			dropParam.type === 'exp' ? dropMode = eval(parse(dropParam.content)) : dropMode = dropParam.content.call(this);
        		} else if (dropParam === 'fillswap') {
                	dropMode = slots - dragElem.size < 0 ? 'swap' : 'fill' ;
				}
              
              	//No slots available
              	if (slots - dragElem.size < 0 && dropMode !== 'swap'){$(e.target).trigger(':noslots');return false;}
  				
				//Confirm target removal
				$(e.target).trigger({type : ':predrop', slots : slots, mode : (e.origin ?? dropMode)});
				$.wiki(onDrop?.contents + onAny?.contents);
  
				const target = findClosest(e,dragElem);
  
				switch (dropMode){
                            
				case 'prepend': case 'append':
					dropElem[dropMode](dragElem.self);
				break;
                case 'swap':
					//Drag elem to container
					if (target === null) {
						//Only child, no element to swap
						dropElem.append(dragElem.self);
					} else {
						$(target[0])[target[1][0] < 0? 'after' : 'before'](dragElem.self);
						if (e.origin !== 'swap'){
							//Avoid infinite swap loop!
							$(target[0]).trigger('dragstart'); // Trigger dragstart on the element being replaced to set _drag
							$(dragElem.origin).trigger({type : 'drop', origin : 'swap'}); // Trigger a drop on the original zone to send the element back to it
							setTimeout(() => { $(target[0]).show() }); //Show it again
						}
					}
				break;        
				case 'remove':
					dragElem.self.remove();
				break;         
				case 'none':break;        
				case 'replace':
					dropElem.append(dragElem.self);
					if (target !== null && !$(target).is(dragElem.self)) {
						//Run removal code on target
						$(target[0]).trigger('dragstart');
						$(dropElem).trigger(':predrop');
						$(target[0]).remove();
					}
				break;         
				case 'replaceall':
					dropElem.empty().append(dragElem.self);
				break;         
				default:
					if (target === null) {
						dropElem.append(dragElem.self);
					} else {
						$(target[0])[target[1][0] < 0 ? 'after' : 'before'](dragElem.self);
					}
				}
              
              	if (slots !== undefined){slots = countSlots()};
  
				//Trigger related event
				$(e.target).trigger(':postdrop');

			})).on('dragenter', this.createShadowWrapper((e) => {
            	e.preventDefault();
                //Has entered from another container
                if (!State.temporary.drag?.origin.is(dropElem)) {$.wiki(onEnter?.contents);}	  
			})).on('dragover', (e) => {
          		e.preventDefault();
        	}).on('dragleave', this.createShadowWrapper((e) => {
            	e.preventDefault();
                //Has left from this container
                if (State.temporary.drag?.origin.is(dropElem)) {$.wiki(onLeave?.contents);}
			})).appendTo(this.output);
	}
});
  
/*-------------------- Drag Macro -----------------------*/
												   
Macro.add('drag', {
	isAsync : true,
	tags : ['onStart', 'data'],
  
	handler() {
		  
		const attributes = this.args.slice(1),
        	innerContent = this.payload[0].contents,
			onStart = this.payload.find(pay => pay.name === 'onStart'),
			data = this.payload.find(pay => pay.name === 'data');
		  
		//Create element
		const dragElem = $(`<${this.args[0] || 'span'}/>`).wiki(innerContent);
	  	
      	//Catch type property
		if (attributes.includes('type')){
			var ID = attributes.deleteAt([attributes.indexOf('type')+1])[0];
			attributes.delete('type');
		}
			
      	//Catch size attribute
		if (attributes.includes('size')){
			var size = attributes.deleteAt([attributes.indexOf('size')+1])[0];
			attributes.delete('size');
		}

      	//Apply properties
		for (let i = 0; i < attributes.length;i+=2) {
			if (typeof attributes[i] === 'object'){// jQuery style object
				dragElem.attr(attributes[i]);
				i--;
			} else { //Simple pair
				dragElem.attr( attributes[i], attributes[i+1]);
			}
		}
		
      	//Special set up if type is supplied
		if (ID){ dragElem.data('drag-type', ID).addClass(`drag-type-${ID}`)}
      
      	//Make all descendants draggable=false
      	dragElem.find('*').prop('draggable', false);
		  
		const oldData = State.temporary.drag;
		  
		dragElem.attr({'draggable':'true','data-size': size ?? 1})
			.addClass(`macro-${this.name}`)
			.on('dragstart touchstart', this.createShadowWrapper((e) => {
                  
				if (e.type === 'touchstart') {
					$(e.target).parent().trigger('dragstart');
                    $('.selected').removeClass('selected');
                    $(e.target).addClass('selected');
                    e.stopPropagation();
                } else {
                	//Hide static copy when dragged
					setTimeout(() => {$(e.target).hide()});
				}
                  
				//Create _drag object
				State.temporary.drag = {
					type : ID,
					self : dragElem,
					size : (size ?? 1),
					data : (data?.args[0] ?? null),
					contents : innerContent,
					origin : $(e.target).parent(),
					originIndex :  $(e.target).index()
				};
  
				//Wikify associated payload
				$.wiki(onStart);
          
			})).on('dragend', this.createShadowWrapper((e) => {
          
				//Reset _drag to former value
				oldData === undefined ? delete State.temporary.drag : State.temporary.drag = oldData;
  
				//Show element again
				$(e.target).show();
			})).appendTo(this.output);
	}
});
