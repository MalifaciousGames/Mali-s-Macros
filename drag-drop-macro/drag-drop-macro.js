/*-------------------- Drop Macro -----------------------*/

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
		  
		let dropMode = null, dropParam = onDrop?.args[0] ?? null;
		const innerContent = this.payload[0].contents;
		  
		//Invalid dropMode
      	if (dropParam){
      		if (typeof dropParam === 'string') {//Param is non-empty string
				if (['append', 'prepend', 'replace','replaceall', 'swap','none','anywhere','remove','fillswap'].includes(dropParam.toLowerCase())) { //Is one of the drop modes
            		dropMode = dropParam;
            	} else {//Is an expression
          	  		dropParam = {type: 'exp', content : dropParam};
            	}
        	} else if (typeof dropParam === 'function') {//Is function
				dropParam = {type: 'func', content : dropParam};
       		} else {//Some truthy value of the wrong type!
        		return this.error(`Drop mode (<<onDrop mode>>) is not valid, reading: '${dropMode}'`);
        	}
        }
      	console.log(dropParam);
		const dropElem = $(`<${elemType || 'div'}/>`).wiki(innerContent);
	  
		//Catch slots property
		if (attributes.includes('slots')){
			var slots = attributes.deleteAt([attributes.indexOf('slots')+1])[0];
			if (typeof slots === 'string' && slots.includes('/')){ //Taylored version
				slots = Number(slots.split('/')[1] - slots.split('/')[0]);
			} else { //Loose logic
				slots -= dropElem.children().length;
			}
			attributes.delete('slots');
          	dropElem.attr('data-slots', slots);
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
			dropElem.data('drop-id', ID).addClass(`drop-${ID}`)
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
		  	.on('dragstart', this.createShadowWrapper(
			  (e) => {
				  const dragElem = State.temporary.drag;
				  
				  //Wait for the ':predrop' event to validate the move
				  //This stops improper drags from running the removal code
				  $(document).off(':predrop');
				  $(document).one(':predrop', (e) => {
						  $.wiki(onRemove?.contents);
						  $.wiki(onAny?.contents);
						  if (slots !== undefined && dragElem.size) {
							  slots += dragElem.size;
							  dropElem.attr('data-slots', slots);
						  }
				  });
			  }
		  ));
		  
		dropElem.on('drop', this.createShadowWrapper(
			(e) => {
				const dragElem = State.temporary.drag;
				if (dragElem){ //Stops people from dragging whatever in the zone
					e.preventDefault();
                  
      				if (dropParam?.type){
        				dropParam.type === 'exp' ? dropMode = eval(dropParam.content) : dropMode = dropParam.content.call(this);
        			}
                  
					if (dropMode === 'fillswap') {
                    	if (slots === undefined){
                        	return this.error(`'Fillswap' mode needs a 'slots' property to work.`);
                        } else {
							dropMode = slots > 0 ? null : 'swap';
                        }
					}
  
					if (ID && dragElem.type !== ID){
						//Wrond id match!
						$(e.target).trigger(':typemismatch');
					} else if (slots - dragElem.size < 0 && dropMode !== 'swap'){
						$(e.target).trigger(':noslots');
					} else {
  
						//Confirm target removal
						$(e.target).trigger({type : ':predrop', slots : slots, origin : e.origin});
  
						$.wiki(onDrop?.contents);
						$.wiki(onAny?.contents);
  
						const target = findClosest(e,dragElem);
  
						switch (dropMode){
                            
						case 'prepend': case 'append':
							dropElem[dropMode](dragElem.self);
							slots !== undefined ? slots -= dragElem.size : null;
							dropElem.attr('data-slots', slots);
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
									$(target[0]).trigger('dragstart');
									$(dragElem.origin).trigger({type : 'drop', origin : 'swap'});
									setTimeout(() => {
										$(target[0]).show();
									});
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
							slots !== undefined ? slots -= dragElem.size : null;
							dropElem.removeAttr('slots').attr('data-slots', slots);
						}
					}
  
					//Trigger related event
					$(e.target).trigger(':postdrop');
				}
			})).on('dragenter', this.createShadowWrapper(
				(e) => {
					//Run onEnter code
					$.wiki(onEnter?.contents);
  
					e.preventDefault();
					  
			})).on('dragover', (e) => {
          		e.preventDefault();
        	}).on('dragleave', this.createShadowWrapper(
				(e) => {
					//Run onLeave code
					$.wiki(onLeave?.contents);
  
					e.preventDefault();
			}))

		dropElem.appendTo(this.output);
	}
});
  
/*-------------------- Drag Macro -----------------------*/
												   
Macro.add('drag', {
	isAsync : true,
	tags : ['onStart', 'data'],
  
	handler() {
		  
		const elemType = this.args[0], attributes = this.args.slice(1);
		const innerContent = this.payload[0].contents,
			onStart = this.payload.find(pay => pay.name === 'onStart'),
			data = this.payload.find(pay => pay.name === 'data');
		  
		//Create element
		const dragElem = $(`<${elemType || 'span'}/>`).wiki(innerContent);
	  	
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
		if (ID){ dragElem.data('drop-id', ID).addClass(`drag-${ID}`) }
      
      	//Make all descendants draggable=false
      	dragElem.find('*').prop('draggable', false);
		  
		const oldData = State.temporary.drag;
		  
		dragElem.attr('draggable','true')
			.addClass(`macro-${this.name}`)
			.on('dragstart', this.createShadowWrapper(
				(e) => {
  
					//Handle old data
					State.temporary.drag = {
						type : ID,
						self : dragElem,
						size : (size ?? 1),
						data : (data?.args[0] ?? null),
						contents : innerContent,
						origin : $(e.target).parent(),
						originIndex : $(e.target).index()
					};
  
					//Wikify associated payload
					$.wiki(onStart);
  
					//Hide static copy when dragged
					setTimeout(() => {
						$(e.target).hide()
					});
  
			})).on('dragend', this.createShadowWrapper(
				(e) => {
  
					//Reset _drag to former value
					oldData === undefined ? 
						delete State.temporary.drag :
						State.temporary.drag = oldData;
  
					//Show element again
					$(e.target).show();
			}));
      
		dragElem.appendTo(this.output);
	}
});
